# ============================================================================
# Hugo Makefile
# - No Node tooling, only Hugo + optional Node generator script
# - All comments in English
# ============================================================================

HUGO ?= hugo
NODE ?= node

# Local default base URL (used when CF_PAGES_URL is not set)
BASEURL ?= http://localhost:1313

# Where the generated drafts file lives.
# IMPORTANT: Your Node script must write to this exact path (or override it).
DRAFTS_FILE ?= assets/__generated/project-drafts.yaml

.PHONY: help dev dev-drafts build clean drafts-gen drafts-rm

help:
	@echo ""
	@echo "Available commands:"
	@echo "  make dev         - Hugo server (no drafts) + generate project-drafts.yaml"
	@echo "  make dev-drafts  - Hugo server (with drafts) + remove project-drafts.yaml"
	@echo "  make build       - Generate drafts data + production build (uses CF_PAGES_URL if set)"
	@echo "  make clean       - Remove generated files (public, resources/_gen, lock, drafts file)"
	@echo ""
	@echo "Variables:"
	@echo "  BASEURL          - Local base URL (default: $(BASEURL))"
	@echo "  CF_PAGES_URL     - Cloudflare Pages base URL (CI), used by 'make build' if present"
	@echo "  DRAFTS_FILE      - Generated drafts YAML path (default: $(DRAFTS_FILE))"
	@echo ""

# Generate the drafts YAML (used by 'dev' and 'build')
drafts-gen:
	$(NODE) scripts/generate-projects-drafts.mjs

# Remove the drafts YAML (used by 'dev-drafts')
drafts-rm:
	rm -f $(DRAFTS_FILE)

# ---------------------------------------------------------------------------
# Development (no drafts) -> show only publishable pages, plus the teaser list
# ---------------------------------------------------------------------------
dev: drafts-gen
	$(HUGO) server \
		--baseURL $(BASEURL) \
		--disableFastRender \
		--environment development

# ---------------------------------------------------------------------------
# Development (with drafts) -> show real draft pages, so remove the teaser list
# ---------------------------------------------------------------------------
dev-drafts: drafts-rm
	$(HUGO) server \
		--baseURL $(BASEURL) \
		--buildDrafts \
		--buildFuture \
		--disableFastRender \
		--environment development

# ---------------------------------------------------------------------------
# Production build (Cloudflare Pages)
# ---------------------------------------------------------------------------
build: drafts-gen
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
	rm -f $(DRAFTS_FILE)