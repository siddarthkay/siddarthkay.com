// Generates src/data/image-dims.json: { "/blog/foo.png": { width, height } }
// so markdown <img> tags can reserve space and avoid layout shift.
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, extname, relative } from "node:path";

const PUBLIC = "public";
const DIRS = ["blog", "projects"];
const OUT = "src/data/image-dims.json";

function pngSize(buf) {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function jpegSize(buf) {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) return null;
    const marker = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    // SOF0..SOF15 except DHT (C4), JPG (C8), DAC (CC)
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  return null;
}

function svgSize(buf) {
  // Only the root <svg> tag's attributes count; child shapes also carry width/height.
  const root = /<svg[^>]*>/.exec(buf.toString("utf8", 0, Math.min(buf.length, 4096)));
  if (!root) return null;
  const text = root[0];
  const w = /\swidth=["']([\d.]+)/.exec(text);
  const h = /\sheight=["']([\d.]+)/.exec(text);
  if (w && h) return { width: Math.round(+w[1]), height: Math.round(+h[1]) };
  const vb = /viewBox=["']\s*[\d.-]+[\s,]+[\d.-]+[\s,]+([\d.]+)[\s,]+([\d.]+)/.exec(text);
  if (vb) return { width: Math.round(+vb[1]), height: Math.round(+vb[2]) };
  return null;
}

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) { walk(full, out); continue; }
    const ext = extname(name).toLowerCase();
    const buf = readFileSync(full);
    let size = null;
    if (ext === ".png") size = pngSize(buf);
    else if (ext === ".jpg" || ext === ".jpeg") size = jpegSize(buf);
    else if (ext === ".svg") size = svgSize(buf);
    if (size) out["/" + relative(PUBLIC, full).split("\\").join("/")] = size;
  }
}

const dims = {};
for (const d of DIRS) walk(join(PUBLIC, d), dims);
const sorted = Object.fromEntries(Object.entries(dims).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(OUT, JSON.stringify(sorted, null, 2) + "\n");
console.log(`image-dims: ${Object.keys(sorted).length} images -> ${OUT}`);
