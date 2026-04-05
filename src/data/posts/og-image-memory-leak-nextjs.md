Our Next.js publishing platform at [Logos](https://press.logos.co) was eating 4.4GB of memory within three minutes of load testing. The container would eventually OOM and restart, only to do it again. The fix was removing a single line of config.

## The symptom

The team had [filed an issue](https://github.com/acid-info/logos-press-engine/issues/217) about the develop container consuming most of the host's CPU and memory. The logs showed `RuntimeError: unreachable` errors from a WASM module inside `og.js`, the OG image generation route. The stack trace pointed to `@resvg/resvg-wasm`, which is what `@vercel/og` uses under the hood to render SVG-based social preview images.

A restart would fix it temporarily, but memory would climb right back up. Classic leak behavior.

## Finding the root cause

The OG image route had this line at the top:

```ts
export const config = { runtime: 'edge' }
```

This tells Next.js to run the route on the Edge runtime. Sounds harmless. The problem is that when you deploy to a standard Node.js environment (not Vercel Edge, not Cloudflare Workers), Next.js still tries to honor this directive. It falls back to using `@resvg/resvg-wasm` to render SVGs natively, because the Edge runtime's built-in renderer isn't available.

And `resvg-wasm` has a [known memory leak](https://github.com/thx/resvg-js/issues/216). Every render allocates WASM memory that never gets freed. On a route that generates OG images for every page on the site, this compounds fast.

Removing that one line switches the route to a standard Node.js API handler, which uses `next/og` instead of `@vercel/og` and avoids the leaky WASM path entirely.

## Measuring the fix

![RSS memory climbing linearly to 4.4GB on master, flat around 2.5GB on the fix branch, over a 3-minute load test](/blog/og-memory-leak-chart.svg)

I ran the same load test against master and the fix branch, sampling RSS and heap every 30 seconds ([PR #264](https://github.com/acid-info/logos-press-engine/pull/264)):

```table
Time     | Master RSS | Master Heap | Fix RSS | Fix Heap
18:08:21 | 1194 MB    | 57 MB       | 1424 MB | 46 MB
18:08:52 | 2201 MB    | 60 MB       | 2425 MB | 77 MB
18:09:22 | 2690 MB    | 311 MB      | 2514 MB | 152 MB
18:09:53 | 3230 MB    | 598 MB      | 2597 MB | 238 MB
18:10:23 | 3720 MB    | 994 MB      | 2553 MB | 109 MB
18:10:54 | 4083 MB    | 1194 MB     | 2627 MB | 220 MB
18:11:24 | 4404 MB    | 1580 MB     | 2571 MB | 148 MB
```

After three minutes, master was at 4404MB RSS with heap still climbing. The fix branch stabilized around 2571MB RSS and 148MB heap. That's 1833MB saved, and more importantly, the heap was flat instead of climbing linearly.

## The other leaks

While I was in there, I found two more unbounded caches that would grow over the server's lifetime:

**Placeholder image cache.** The `PlaceholderService` stored base64 placeholder strings in a `Map` with no eviction. Every new image processed by `getStaticProps` during ISR revalidation added an entry that was never removed. I added a FIFO cap at 500 entries.

**Search index cache.** The `PostSearchService` accumulated Lunr inverted indexes keyed by query parameters. Same story: no eviction, unbounded growth. Capped at 50 entries with FIFO eviction.

Neither of these was the primary leak, but on a long-running server they would have caused problems eventually.

## Font loading

The original code fetched font files over HTTP on every OG image request:

```ts
const font = await fetch(new URL('../../assets/fonts/Lora.ttf', import.meta.url))
```

I replaced this with `fs.readFileSync` at module level, caching the buffers. If the read fails, the buffer resets to `null` so the next request retries instead of serving broken images forever. This cut per-request latency and removed a network dependency from the render path.

## Caching and security

Two more things while I had the file open:

**Cache-Control header.** OG images are deterministic for a given page. I added `public, max-age=3600, immutable` so the CDN caches them for an hour instead of regenerating on every social media crawler hit.

**SSRF protection.** The OG route accepted an image URL parameter that it would fetch and embed. I added an `ALLOWED_IMAGE_HOSTS` allowlist and a `sanitizeImageUrl()` function. Without this, an attacker could point the URL at internal services and use the OG route as a proxy.

## The one-line lesson

The root cause was a single config export that was probably copy-pasted from a Vercel tutorial. It worked fine on Vercel's Edge runtime. It leaked 1.8GB in three minutes on a standard Node.js deployment.

The broader lesson: runtime directives in Next.js are not just hints. They fundamentally change which rendering pipeline your code runs through. If you're deploying to anything other than Vercel's Edge network, audit every `runtime: 'edge'` declaration and make sure the fallback path is something you actually want.
