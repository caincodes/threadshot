// Builds the site icons in public/ from one drawing:
//   favicon.svg, favicon.ico (16/32/48), apple-touch-icon.png,
//   icon-192.png, icon-512.png and icon-maskable-512.png.
//
//   node scripts/favicon/build.mjs
//
// Needs Playwright with Chromium installed; it is not a project dependency.
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const { chromium } = createRequire(import.meta.url)("playwright");
const publicDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "public");

const INK = "#0f1419";

// A post title, then a reply set in from a bar: the shape of a thread.
const glyph = (scale) => `<g class="g" fill="#fff" transform="translate(16 16) scale(${scale}) translate(-16 -16)">
    <rect x="6" y="6" width="20" height="5.5" rx="1"/>
    <rect x="6" y="15" width="3.5" height="11" rx="1"/>
    <rect x="12.5" y="15" width="13.5" height="5" rx="1"/>
    <rect x="12.5" y="21" width="9" height="5" rx="1"/>
  </g>`;

// Black tabs vanish on a dark tab strip, so the SVG swaps to white on dark.
const darkMode = `<style>@media (prefers-color-scheme: dark) { .t { fill: #fff } .g { fill: ${INK} } }</style>`;

// The full-bleed square is cropped to a circle or squircle by some systems, so
// its drawing is kept inside the middle of the tile.
const svg = (corner, scale, withDarkMode = false) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  ${withDarkMode ? `${darkMode}\n  ` : ""}<rect class="t" width="32" height="32" rx="${corner}" fill="${INK}"/>
  ${glyph(scale)}
</svg>
`;

const rounded = svg(2.5, 1);
const square = svg(0, 0.9);
writeFileSync(join(publicDir, "favicon.svg"), svg(2.5, 1, true));

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
writeFileSync(join(publicDir, "icon-192.png"), await render(rounded, 192));
writeFileSync(join(publicDir, "icon-512.png"), await render(rounded, 512));
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
