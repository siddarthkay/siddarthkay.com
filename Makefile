.PHONY: dev build preview lint test test-watch test-e2e \
       blog-og fetch-whoop fetch-steam fetch-data \
       typecheck clean deploy-local

# ── Development ──────────────────────────────────────────

dev:
	npm run dev

preview:
	npm run preview

# ── Build ────────────────────────────────────────────────

build:
	npm run build

clean:
	rm -rf dist

# ── Quality ──────────────────────────────────────────────

lint:
	npm run lint

typecheck:
	npx tsc --noEmit

test:
	npm run test

test-watch:
	npm run test:watch

test-e2e:
	npx playwright test

# ── Data fetching (mirrors CI) ───────────────────────────

fetch-whoop:
	node scripts/fetch-whoop.mjs

fetch-steam:
	node scripts/fetch-steam.mjs

fetch-data: fetch-whoop fetch-steam

# ── Blog ─────────────────────────────────────────────────

blog-og:
	node scripts/generate-og-images.mjs

# ── Full pipeline (mirrors GitHub Actions) ───────────────

deploy-local: fetch-data build test-e2e
	@echo "Build complete. Artifacts in dist/"
