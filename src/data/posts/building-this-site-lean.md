This site has no backend. No database. No server you need to SSH into at 2 AM because a process died. It's a React SPA deployed to GitHub Pages, with live data pulled by a GitHub Action on an hourly cron. The total infrastructure cost is zero dollars.

![That's not a limitation. It's the design.](/blog/it-was-by-design.png)

## Why not a "real" backend

I've spent years building and maintaining CI/CD pipelines, Docker images, and cloud infrastructure for other projects. The last thing I wanted for my personal site was another piece of infrastructure to babysit.

![burnt out brother](/blog/burnt-out.jpeg)

The typical approach for a personal site with live data would be: spin up a small server, write an API, add a database, set up SSL, configure a reverse proxy, monitor uptime, handle deployments. 
For what? A website that the primeagen wont even review on his stream.
![primeagen-disaaproval](/blog/primeagen-dissaproval.png)


The constraint I set was simple: the site should run entirely on free static hosting, with no server process running anywhere. Everything the visitor sees should be a static file served from a CDN.

## The build is the backend

The key insight is that "live" data doesn't need to be fetched at request time. It just needs to be recent enough. For my use case, hourly is more than sufficient.

The GitHub Actions workflow runs on three triggers:

```yaml
on:
  push:
    branches: [main]
  schedule:
    - cron: '0 * * * *'
  workflow_dispatch:
```

Every hour, the workflow wakes up, fetches data from external APIs, commits the results to the repo, builds the site, and deploys it. The "backend" is a scheduled CI job.

## Fetching live data

The site currently pulls from two APIs: Whoop (health and recovery data) and Steam (recently played games). Each has its own fetch script that runs as a build step.

```yaml
- name: Fetch Whoop data
  env:
    WHOOP_CLIENT_ID: ${{ secrets.WHOOP_CLIENT_ID }}
    WHOOP_CLIENT_SECRET: ${{ secrets.WHOOP_CLIENT_SECRET }}
    WHOOP_REFRESH_TOKEN: ${{ secrets.WHOOP_REFRESH_TOKEN }}
  run: node scripts/fetch-whoop.mjs

- name: Fetch Steam data
  env:
    STEAM_API_KEY: ${{ secrets.STEAM_API_KEY }}
  run: node scripts/fetch-steam.mjs
```

Two things to note here.

First, secrets never touch the codebase. No `.env` files, no config objects with API keys, no "remember to add this to .gitignore" mistakes. Everything sensitive lives in GitHub Actions secrets and is injected as environment variables at runtime.

Second, If the Whoop API is down, or Steam rate-limits us, or the network flakes out, the build doesn't fail. It just uses whatever data was committed last time. The site always deploys, even if the APIs don't cooperate.

## Token rotation without a server

The Whoop API uses OAuth2 with rotating refresh tokens. Every time you use a refresh token, the old one is invalidated and you get a new one. If you lose the new token, you're locked out.


![locked out frustration](/blog/locked-out.jpeg)

In a traditional setup, you'd store the token in a database and update it after each refresh. Without a server, I needed somewhere durable to put it.

The solution: the fetch script writes the new refresh token to a temporary file, and a subsequent build step uses the GitHub CLI to update the secret:

```yaml
- name: Update refresh token secret if rotated
  if: always()
  env:
    GH_TOKEN: ${{ secrets.PAT_TOKEN }}
  run: |
    if [ -f .whoop-refresh-token ]; then
      gh secret set WHOOP_REFRESH_TOKEN < .whoop-refresh-token
      rm .whoop-refresh-token
      echo "Refresh token secret updated."
    else
      echo "No token rotation needed."
    fi
```

The `if: always()` ensures this step runs even if earlier steps fail. If the script successfully refreshed the token but then crashed while processing the data, the new token is still saved. Without this, a crash during data processing could permanently invalidate the token.

This requires a Personal Access Token (`PAT_TOKEN`) with permission to write repository secrets. That's one extra secret to manage, but it means the OAuth flow is fully automated with no manual intervention.

## Git as the data store

After the fetch scripts run, the workflow commits the updated JSON files back to the repository:

```yaml
- name: Commit updated data
  run: |
    git config user.name "github-actions[bot]"
    git config user.email "github-actions[bot]@users.noreply.github.com"
    git add src/data/whoop-data.json src/data/steam-data.json
    git diff --cached --quiet || git commit -m "chore: update live data" && git push
```

The data files are regular JSON files that are imported by the React app at build time. There's no runtime data fetching. The visitor's browser never calls the Whoop or Steam APIs.

This also gives you a full history of every data point, for free. Want to see what games I was playing three months ago? `git log --follow src/data/steam-data.json`.

## Prerendering for SEO

A React SPA on GitHub Pages has a major problem: crawlers see an empty `<div id="root"></div>`. Google's crawler does execute JavaScript, but it's deferred and unreliable for indexing.

![Google](/blog/SEO.jpeg)

The fix is a two-stage prerendering pipeline that runs at the end of every build:

1. **`prerender-meta.mjs`** generates per-route HTML files with correct `<title>`, `<meta>`, Open Graph tags, structured data (JSON-LD), canonical URLs, and a sitemap. This ensures crawlers get the right metadata even without executing JavaScript.

2. **`prerender-html.mjs`** launches a Playwright browser, visits each route, scrolls to the bottom to trigger all viewport-based animations, then extracts the rendered `<body>` HTML and splices it into the files from step 1. The `<head>` with all its carefully crafted meta tags is preserved.

The result: every route is a fully rendered HTML file with correct SEO metadata and visible content. No SSR server, no Vercel, no Cloudflare Workers. Just a build step that uses the same Playwright installation that already exists for the test suite.

## The data validation safety net

One risk with automated data fetching is corrupting your data files. If the Whoop API returns an empty response during a partial outage, you don't want to overwrite a week of good data with an empty JSON file.

Both fetch scripts validate the response before writing:

```js
// Only write if we got real data
if (!latestCycle?.score?.strain) {
  console.log("No scored cycle data, skipping write");
  process.exit(0);
}
```

The Steam script does the same check: if the API returns zero games, it assumes something went wrong and exits without writing. The committed data from the last successful fetch remains intact.

## What this actually costs

The entire stack:

- **Hosting:** GitHub Pages. Free.
- **CI/CD:** GitHub Actions. Free for public repos.
- **Domain:** Custom domain via DNS. ~$10/year.
- **APIs:** Whoop and Steam APIs. Free.
- **CDN:** GitHub Pages includes Fastly CDN. Free.
- **SSL:** GitHub Pages auto-provisions via Let's Encrypt. Free.


![site budget](/blog/budget.jpeg)

There's no server to pay for, no database to back up, no uptime monitoring to configure. If GitHub Pages goes down, so does every other GitHub-hosted project. That's a bet I'm comfortable making.

## Trade-offs

This approach has real limitations.

**Hourly freshness ceiling.** Data is at most one hour stale. For real-time applications, this doesn't work. For a personal site showing fitness trends and recently played games, it's fine.

**Build time is deploy time.** Every data update triggers a full site build. Right now that takes about 40 seconds including Playwright prerendering. If the site grows significantly, this could become slow.

**GitHub Actions as a dependency.** If GitHub Actions has an outage, data stops updating. The site itself stays up (it's static files on a CDN), but the data goes stale until Actions recovers.

**Secret management is manual once.** You need to set up the initial secrets in the GitHub repository settings by hand. After that, token rotation is automated, but the first setup requires clicking through the UI.

![context](/blog/context.jpeg)

None of these are dealbreakers for a personal site. They'd be serious problems for a production SaaS product. Know your context.

## The principle

Every piece of infrastructure you run is a piece of infrastructure you maintain. For a personal site, my goal isn't to build something impressive. It's to build something that works while I'm not looking at it.

This site updates itself every hour, deploys itself on every push, handles API failures gracefully, rotates its own OAuth tokens, and costs nothing to run. There's no server to restart, no database to migrate, no container to rebuild.

![fin](/blog/fin.jpeg)

The best infrastructure is the infrastructure you don't have to think about.
Fin.
