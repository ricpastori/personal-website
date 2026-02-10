# ============================================================================
# Hugo Makefile
# - No Node tooling, only Hugo + optional Node generator script
# - Explicit targets, measurable behavior, predictable defaults
# ============================================================================

HUGO ?= hugo
NODE ?= node

# Local default base URL (used when CF_PAGES_URL is not set)
BASEURL ?= http://localhost:1313

.PHONY: help dev dev-drafts build clean

help:
	@echo ""
	@echo "Available commands:"
	@echo "  make dev         - Run Hugo server (no drafts)"
	@echo "  make dev-drafts  - Run Hugo server (with drafts + future)"
	@echo "  make build       - Generate drafts data + production build (uses CF_PAGES_URL if set)"
	@echo "  make clean       - Remove generated files (public, resources/_gen, lock)"
	@echo ""
	@echo "Variables:"
	@echo "  BASEURL          - Local base URL (default: $(BASEURL))"
	@echo "  CF_PAGES_URL     - Cloudflare Pages base URL (CI), used by 'make build' if present"
	@echo ""

# ---------------------------------------------------------------------------
# Development (no drafts)
# ---------------------------------------------------------------------------
dev:
	$(HUGO) server \
		--baseURL $(BASEURL) \
		--disableFastRender \
		--environment development

# ---------------------------------------------------------------------------
# Development (with drafts)
# ---------------------------------------------------------------------------
dev-drafts:
	$(HUGO) server \
		--baseURL $(BASEURL) \
		--buildDrafts \
		--buildFuture \
		--disableFastRender \
		--environment development

# ---------------------------------------------------------------------------
# Production build (Cloudflare Pages)
# - Uses CF_PAGES_URL when set, otherwise falls back to BASEURL
# ---------------------------------------------------------------------------
build:
	$(NODE) scripts/generate-projects-drafts.mjs
	$(HUGO) \
		--baseURL $${CF_PAGES_URL:-$(BASEURL)} \
		--gc \
		--minify \
		--environment production

# ---------------------------------------------------------------------------
# Clean generated files
# ---------------------------------------------------------------------------
clean:
	rm -rf public resources/_gen .hugo_build.lock