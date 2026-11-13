// Builds the site icons in public/ from one drawing:
//   favicon.svg, favicon.ico (16/32/48), apple-touch-icon.png,
//   icon-192.png, icon-512.png and icon-maskable-512.png, from the logo in
//   scripts/logo/geometry.mjs.
//
//   node scripts/favicon/build.mjs
//
// Needs Playwright with Chromium installed; it is not a project dependency.
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { smallSymbol, tile } from "../logo/geometry.mjs";

const { chromium } = createRequire(import.meta.url)("playwright");
const publicDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "public");

// The vermilion tile shows on light and dark tab strips alike, so one drawing
// serves both. The small-size cut stays legible at 16 px.
const rounded = tile({ shape: smallSymbol, corner: 48, scale: 0.86 });
const appIcon = tile();
// The full-bleed square is cropped to a circle or squircle by some systems, so
// its drawing is kept inside the middle of the tile.
const square = tile({ corner: 0, scale: 0.56 });
writeFileSync(join(publicDir, "favicon.svg"), rounded);

const browser = await chromium.launch();
const page = await browser.newPage();

const render = async (markup, size) => {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${markup}`
  );
  return page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
};

writeFileSync(join(publicDir, "apple-touch-icon.png"), await render(square, 180));
writeFileSync(join(publicDir, "icon-192.png"), await render(appIcon, 192));
writeFileSync(join(publicDir, "icon-512.png"), await render(appIcon, 512));
writeFileSync(join(publicDir, "icon-maskable-512.png"), await render(square, 512));

// An .ico can carry PNG images, so each size is drawn natively rather than shrunk.
const sizes = [16, 32, 48];
const images = [];
for (const size of sizes) images.push(await render(rounded, size));
await browser.close();

const header = Buffer.alloc(6);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const entries = sizes.map((size, index) => {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size, 0);
  entry.writeUInt8(size, 1);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(images[index].length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += images[index].length;
  return entry;
});
writeFileSync(join(publicDir, "favicon.ico"), Buffer.concat([header, ...entries, ...images]));
console.log("icons written");
