// The threadshot mark: viewfinder corners that close into a speech bubble,
// framing two lines of text. Drawn on a 256 grid.
export const INK = "#0f1419";
export const VERMILION = "#bf3b0f";
export const WHITE = "#ffffff";

const n = (value) => String(Math.round(value * 100) / 100);

// Four corners around a gap; the bottom-left one is square and runs out into a
// 45° tail, which is what makes the frame read as a bubble.
const frame = ({ x0, y0, x1, y1, stroke: s, radius: R, gap, middle }) => {
  const r = R - s;
  const left = (x0 + x1) / 2 - gap / 2;
  const right = (x0 + x1) / 2 + gap / 2;
  const top = middle - gap / 2;
  const bottom = middle + gap / 2;
  return [
    `M${n(x0)} ${n(top)}V${n(y0 + R)}A${R} ${R} 0 0 1 ${n(x0 + R)} ${n(y0)}H${n(left)}V${n(y0 + s)}H${n(x0 + R)}A${r} ${r} 0 0 0 ${n(x0 + s)} ${n(y0 + R)}V${n(top)}Z`,
    `M${n(right)} ${n(y0)}H${n(x1 - R)}A${R} ${R} 0 0 1 ${n(x1)} ${n(y0 + R)}V${n(top)}H${n(x1 - s)}V${n(y0 + R)}A${r} ${r} 0 0 0 ${n(x1 - R)} ${n(y0 + s)}H${n(right)}Z`,
    `M${n(x1)} ${n(bottom)}V${n(y1 - R)}A${R} ${R} 0 0 1 ${n(x1 - R)} ${n(y1)}H${n(right)}V${n(y1 - s)}H${n(x1 - R)}A${r} ${r} 0 0 0 ${n(x1 - s)} ${n(y1 - R)}V${n(bottom)}Z`,
    `M${n(x0)} ${n(bottom)}H${n(x0 + s)}V${n(y1 - s)}H${n(left)}V${n(y1)}H${n(x0 + s)}L${n(x0)} ${n(y1 + s)}Z`,
  ].join(" ");
};

const pill = (x, y, width, height) => {
  const r = height / 2;
  return `M${n(x + r)} ${n(y)}H${n(x + width - r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + width - r)} ${n(y + height)}H${n(x + r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + r)} ${n(y)}Z`;
};

export const symbol = {
  frame: frame({ x0: 32, y0: 24, x1: 224, y1: 216, stroke: 24, radius: 56, gap: 32, middle: 120 }),
  lines: `${pill(80, 84, 96, 24)} ${pill(80, 132, 64, 24)}`,
};

// For 16–32 px: a heavier frame, wider gaps and fatter lines.
export const smallSymbol = {
  frame: frame({ x0: 20, y0: 12, x1: 236, y1: 212, stroke: 36, radius: 64, gap: 44, middle: 112 }),
  lines: `${pill(76, 76, 100, 32)} ${pill(76, 128, 60, 32)}`,
};

export const markPaths = (shape, frameColor, linesColor, transform = "") => {
  const at = transform ? ` transform="${transform}"` : "";
  if (frameColor === linesColor) {
    return `<path${at} fill="${frameColor}" d="${shape.frame} ${shape.lines}"/>`;
  }
  return `<g${at}><path fill="${frameColor}" d="${shape.frame}"/><path fill="${linesColor}" d="${shape.lines}"/></g>`;
};

// The app icon: the mark in white on a vermilion tile.
export const tile = ({ shape = symbol, corner = 56, scale = 0.72 } = {}) => {
  const offset = 128 - 128 * scale;
  const transform = `translate(${n(offset)} ${n(offset + 6 * scale)}) scale(${scale})`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <rect width="256" height="256"${corner ? ` rx="${corner}"` : ""} fill="${VERMILION}"/>
  ${markPaths(shape, WHITE, WHITE, transform)}
</svg>
`;
};
