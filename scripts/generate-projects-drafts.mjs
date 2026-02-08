#!/usr/bin/env node
// All comments must be written in English.

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

// Where your draft source lives (bundle folders)
const CONTENT_ROOT = path.join(ROOT, "content", "projects");

// Where Hugo reads global pipeline resources
const ASSETS_GEN_ROOT = path.join(ROOT, "assets", "__generated", "drafts", "projects");

// Data output (underscore to avoid Hugo key issues)
const OUT_FILE = path.join(ROOT, "data", "projects_drafts.yaml");

function extractFrontMatter(markdown) {
  // Allow optional BOM and leading whitespace/newlines before front matter.
  const m = markdown.match(/^\uFEFF?\s*---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n/);
  return m ? m[1] : null;
}

function parseScalar(raw) {
  const v = raw.trim();
  if (v === "true") return true;
  if (v === "false") return false;
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    return v.slice(1, -1);
  }
  return v;
}

function parseFrontMatterSubset(fmText) {
  const out = {};
  for (const line of fmText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const idx = trimmed.indexOf(":");
    if (idx === -1) continue;

    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!key) continue;

    out[key] = parseScalar(value);
  }
  return out;
}

function walkIndexMd(dir) {
  /** @type {string[]} */
  const files = [];
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      files.push(...walkIndexMd(full));
    } else if (ent.isFile() && ent.name === "index.md") {
      files.push(full);
    }
  }
  return files;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function yamlQuote(str) {
  const s = String(str).replaceAll("\\", "\\\\").replaceAll('"', '\\"');
  return `"${s}"`;
}

function toYaml(items) {
  const lines = [];
  for (const it of items) {
    lines.push(`- title: ${yamlQuote(it.title || "Untitled")}`);
    if (it.eyebrow) lines.push(`  eyebrow: ${yamlQuote(it.eyebrow)}`);
    if (it.description) lines.push(`  description: ${yamlQuote(it.description)}`);
    if (it.image) lines.push(`  image: ${yamlQuote(it.image)}`);
    if (it.start) lines.push(`  start: ${yamlQuote(it.start)}`);
    if (it.end) lines.push(`  end: ${yamlQuote(it.end)}`);
    lines.push(`  badge: ${yamlQuote(it.badge || "Coming Soon")}`);
  }
  return lines.length ? lines.join("\n") + "\n" : "";
}

function copyDraftImage({ bundleDir, slug, imageValue }) {
  if (!imageValue) return "";

  // Normalize like Hugo does: no leading slashes
  const rel = String(imageValue).replace(/^\/+/, "");

  // Resolve path relative to the bundle dir (content/projects/<slug>/)
  const src = path.join(bundleDir, rel);

  if (!fs.existsSync(src) || !fs.statSync(src).isFile()) {
    return "";
  }

  // Preserve subfolders if imageValue includes them (e.g. "images/thumb.png")
  const destDir = path.join(ASSETS_GEN_ROOT, slug, path.dirname(rel));
  ensureDir(destDir);

  const dest = path.join(destDir, path.basename(rel));
  fs.copyFileSync(src, dest);

  // Return path relative to /assets for resources.Get
  const hugoRel = path
    .join("__generated", "drafts", "projects", slug, path.dirname(rel), path.basename(rel))
    .replaceAll("\\", "/")
    .replaceAll("/./", "/");

  return hugoRel;
}

function main() {
  // Clean generated folder so removed drafts don't leave stale images
  if (fs.existsSync(ASSETS_GEN_ROOT)) {
    fs.rmSync(ASSETS_GEN_ROOT, { recursive: true, force: true });
  }
  ensureDir(ASSETS_GEN_ROOT);

  const mdFiles = walkIndexMd(CONTENT_ROOT);

  /** @type {Array<Record<string, string>>} */
  const drafts = [];

  for (const file of mdFiles) {
    const md = fs.readFileSync(file, "utf8");
    const fmRaw = extractFrontMatter(md);
    if (!fmRaw) continue;

    const fm = parseFrontMatterSubset(fmRaw);
    if (fm.draft !== true) continue;

    const bundleDir = path.dirname(file);

    // slug = folder name containing index.md
    const slug = path.basename(bundleDir);

    // Copy image from bundle into assets/__generated/...
    const imageGlobal = copyDraftImage({
      bundleDir,
      slug,
      imageValue: fm.image || "",
    });

    if (!imageGlobal && fm.image) {
      console.warn(`WARN: Draft image not found for ${file} -> ${fm.image}`);
    }

    drafts.push({
      title: fm.title || "Untitled",
      eyebrow: fm.eyebrow || "",
      description: fm.description || "",
      image: imageGlobal, // IMPORTANT: now a global assets path
      start: fm.start || "",
      end: fm.end || "",
      badge: fm.badge || "Coming Soon",
    });
  }

  // Sort drafts (newest end/start first). ISO strings sort well.
  drafts.sort((a, b) => {
    const ae = a.end || "";
    const be = b.end || "";
    if (ae !== be) return be.localeCompare(ae);

    const as = a.start || "";
    const bs = b.start || "";
    if (as !== bs) return bs.localeCompare(as);

    return (a.title || "").localeCompare(b.title || "");
  });

  ensureDir(path.dirname(OUT_FILE));
  fs.writeFileSync(OUT_FILE, toYaml(drafts), "utf8");

  console.log(`Wrote ${drafts.length} draft project(s) -> ${OUT_FILE}`);
}

main();