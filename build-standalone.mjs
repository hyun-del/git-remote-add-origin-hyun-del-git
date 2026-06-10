#!/usr/bin/env node
/**
 * build-standalone.mjs
 * Builds the forensic simulator as a single self-contained HTML file.
 * Run after `pnpm --filter @workspace/forensic-simulator run build`
 *
 * Output:
 *   forensic-simulator.html   (in the forensic-simulator package root)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, "..", "dist", "public");
const OUTPUT = path.resolve(__dirname, "..", "forensic-simulator.html");

function readDistFile(relPath) {
  return fs.readFileSync(path.join(DIST, relPath), "utf-8");
}

function readDistBinary(relPath) {
  return fs.readFileSync(path.join(DIST, relPath));
}

function toBase64DataUri(relPath, mimeType) {
  const buf = readDistBinary(relPath);
  return `data:${mimeType};base64,${buf.toString("base64")}`;
}

function mimeOf(filename) {
  if (filename.endsWith(".png"))  return "image/png";
  if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) return "image/jpeg";
  if (filename.endsWith(".svg"))  return "image/svg+xml";
  if (filename.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}

function walk(dir, base = "") {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) results.push(...walk(path.join(dir, entry.name), rel));
    else results.push(rel);
  }
  return results;
}

async function main() {
  if (!fs.existsSync(DIST)) {
    console.error("❌  dist/public/ not found. Run `PORT=3000 BASE_PATH=/ pnpm --filter @workspace/forensic-simulator run build` first.");
    process.exit(1);
  }

  let html = readDistFile("index.html");
  console.log("  Original HTML:", html.slice(0, 200).replace(/\n/g, " "));

  /* 1. Collect all image files from dist root (copied from public/) */
  const allFiles = walk(DIST);
  const imageFiles = allFiles.filter((f) =>
    /\.(png|jpg|jpeg|svg|webp)$/i.test(f) &&
    !f.startsWith("assets/")
  );

  const imageMap = {};
  for (const rel of imageFiles) {
    const dataUri = toBase64DataUri(rel, mimeOf(rel));
    imageMap[`/${rel}`] = dataUri;
    imageMap[rel] = dataUri;
  }
  console.log(`  ✓ ${imageFiles.length} image(s) collected:`, imageFiles.join(", "));

  /* 2. Inline CSS — handle any variant of <link rel="stylesheet" ...> */
  html = html.replace(
    /<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*\/?>/g,
    (match, href) => {
      const rel = href.replace(/^\//, "");
      const cssPath = path.join(DIST, rel);
      if (!fs.existsSync(cssPath)) { console.log("  ⚠ CSS not found:", rel); return match; }
      const css = fs.readFileSync(cssPath, "utf-8");
      console.log(`  ✓ CSS inlined: ${rel} (${(css.length/1024).toFixed(0)} KB)`);
      return `<style>${css}</style>`;
    }
  );

  /* 3. Inline JS — handle any variant of <script type="module" ...src="..."> */
  html = html.replace(
    /<script[^>]*type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g,
    (match, src) => {
      const rel = src.replace(/^\//, "");
      const jsPath = path.join(DIST, rel);
      if (!fs.existsSync(jsPath)) { console.log("  ⚠ JS not found:", rel); return match; }
      let js = fs.readFileSync(jsPath, "utf-8");

      /* Replace image URL strings with base64 data URIs */
      for (const [urlPath, dataUri] of Object.entries(imageMap)) {
        const escaped = urlPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        js = js.replace(new RegExp(`"${escaped}"`, "g"), JSON.stringify(dataUri));
        js = js.replace(new RegExp(`'${escaped}'`, "g"), `'${dataUri}'`);
      }

      console.log(`  ✓ JS inlined: ${rel} (${(js.length/1024).toFixed(0)} KB)`);
      /* Remove module for standalone compat (images already resolved) */
      return `<script>${js}</script>`;
    }
  );

  /* 4. Remove preload links */
  html = html.replace(/<link[^>]*rel="modulepreload"[^>]*\/?>/g, "");

  /* 5. Write output */
  fs.writeFileSync(OUTPUT, html, "utf-8");
  const sizeKB = (fs.statSync(OUTPUT).size / 1024).toFixed(0);
  console.log(`\n✅  ${OUTPUT}\n    Size: ${sizeKB} KB\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
