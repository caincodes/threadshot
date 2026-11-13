// Writes the logo kit to design/logo/svg: the symbol, a small-size cut,
// horizontal and stacked lockups and the wordmark, in each colour scheme.
//
//   node scripts/logo/build.mjs
//
// The wordmark is Archivo ExtraBold at -0.02em, outlined into wordmark.json by
// outline-wordmark.cjs (which needs fontkit, not a project dependency).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { INK, VERMILION, WHITE, markPaths, smallSymbol, symbol, tile } from "./geometry.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "..", "design", "logo", "svg");
const word = JSON.parse(readFileSync(join(here, "wordmark.json"), "utf8"));
mkdirSync(out, { recursive: true });

const n = (value) => String(Math.round(value * 100) / 100);
const svg = (width, height, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n(width)} ${n(height)}" width="${n(width)}" height="${n(height)}" role="img" aria-labelledby="title">
  <title id="title">threadshot</title>
  ${body}
</svg>
`;
// Scaled so the word's ascenders stand `height` units tall.
const wordmark = (color, x, baseline, height) =>
  `<path fill="${color}" transform="translate(${n(x)} ${n(baseline)}) scale(${(height / word.ascender).toFixed(5)})" d="${word.d}"/>`;
const wordWidth = (height) => (word.width * height) / word.ascender;

const schemes = {
  color: [INK, VERMILION, INK],
  black: [INK, INK, INK],
  white: [WHITE, WHITE, WHITE],
  vermilion: [VERMILION, VERMILION, VERMILION],
  reversed: [WHITE, VERMILION, WHITE],
};

const write = (name, content) => writeFileSync(join(out, name), content);

for (const [name, [frame, lines, text]] of Object.entries(schemes)) {
  write(`threadshot-symbol-${name}.svg`, svg(256, 256, markPaths(symbol, frame, lines)));
  write(`threadshot-symbol-small-${name}.svg`, svg(256, 256, markPaths(smallSymbol, frame, lines)));
  write(
    `threadshot-horizontal-${name}.svg`,
    svg(296 + wordWidth(120), 256, `${markPaths(symbol, frame, lines)}\n  ${wordmark(text, 272, 180, 120)}`)
  );
  const stackedWidth = wordWidth(76) + 64;
  write(
    `threadshot-stacked-${name}.svg`,
    svg(stackedWidth, 368, `${markPaths(symbol, frame, lines, `translate(${n(stackedWidth / 2 - 128)} 0)`)}\n  ${wordmark(text, 32, 344, 76)}`)
  );
  write(`threadshot-wordmark-${name}.svg`, svg(wordWidth(120) + 32, 152, wordmark(text, 16, 136, 120)));
}

write("threadshot-app-icon.svg", tile());
write("threadshot-app-icon-maskable.svg", tile({ corner: 0, scale: 0.56 }));
write("threadshot-favicon.svg", tile({ shape: smallSymbol, corner: 48, scale: 0.86 }));
console.log("logo kit written");
