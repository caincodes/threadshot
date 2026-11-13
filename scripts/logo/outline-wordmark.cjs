// Outlines "threadshot" in Archivo ExtraBold at -0.02em into wordmark.json.
//
//   npm i --no-save fontkit @fontsource/archivo
//   node scripts/logo/outline-wordmark.cjs
const { writeFileSync } = require("node:fs");
const { join } = require("node:path");
const fontkit = require("fontkit");

const font = fontkit.openSync(
  require.resolve("@fontsource/archivo/files/archivo-latin-800-normal.woff")
);
const tracking = -0.02 * font.unitsPerEm;
const run = font.layout("threadshot");
let x = 0;
const paths = run.glyphs.map((glyph) => {
  const path = glyph.path.scale(1, -1).translate(x, 0).toSVG();
  x += glyph.advanceWidth + tracking;
  return path;
});
const width = Math.round((x - tracking) * 100) / 100;
// Ascender height of the outlined letters (t, h, d), in font units.
writeFileSync(
  join(__dirname, "wordmark.json"),
  JSON.stringify({ d: paths.join(" "), width, ascender: 724 })
);
