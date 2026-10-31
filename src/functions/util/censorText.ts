// Redaction swaps a name for text of the same length, covered by a solid box or
// a pen scribble with the "u/" or "r/" kept in front, so the mark roughly matches
// the name and the real name is never in the page. "hide" removes the name and
// its prefix altogether. Names are matched only when
// the prefix is not part of a longer word ("menu/..." is left alone), which also
// covers links such as reddit.com/u/name.
export type RedactStyle = "box" | "scribble" | "hide";

const maskName = (name: string) => "x".repeat(name.length);

const seededRandom = (start: number) => {
  let seed = start;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
};

// Letters to peek out from under a scribble. They come from the length alone, so
// nothing of the real name is in them.
const gibberish = (length: number) => {
  const random = seededRandom(length * 104729 + 7);
  return Array.from({ length }, () =>
    String.fromCharCode(97 + Math.floor(random() * 26))
  ).join("");
};

const SCRIBBLE_LEAN = 2.5;

// A pen zigzagging along the name, with gaps that let letters show through.
// Seeded by the length so a name keeps its scribble between renders.
const scribblePath = (length: number, width: number) => {
  const random = seededRandom(length * 7919 + 1);
  const points: [number, number][] = [];
  let isTop = true;
  for (let x = 0; x < width + 4; x += 3.2 + random()) {
    const y = isTop ? random() * 2 : 10 + random() * 2;
    // A right-handed pen: strokes lean right toward the top.
    points.push([x + (isTop ? SCRIBBLE_LEAN : -SCRIBBLE_LEAN), y]);
    isTop = !isTop;
  }

  // Every point pulls a curve toward it between the midpoints either side, which
  // rounds the turns the way a pen does. Starting and ending on a midpoint gives
  // the first and last strokes the same height as the rest.
  const midpoint = (index: number) =>
    points[index].map((value, axis) =>
      ((value + points[index + 1][axis]) / 2).toFixed(1)
    );
  const curves = points.slice(1, -1).map(([x, y], index) => {
    const [endX, endY] = midpoint(index + 1);
    return `Q${x.toFixed(1)} ${y.toFixed(1)} ${endX} ${endY}`;
  });
  return `M${midpoint(0).join(" ")}${curves.join("")}`;
};

// Masked text keeps the mark about as wide as the name it covers.
export const redactedHtml = (name: string, style: RedactStyle) => {
  const width = name.length * 6;
  const scribble =
    style === "scribble"
      ? `<svg aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 ${width} 12"><path d="${scribblePath(name.length, width)}"/></svg>`
      : "";
  const text = style === "scribble" ? gibberish(name.length) : maskName(name);
  return `<span class="redacted" data-style="${style}">${text}${scribble}</span>`;
};

const MENTION = (prefix: string) =>
  new RegExp(`(?<!\\w)(\\/?${prefix}\\/)([\\w-]+)`, "gi");

const TAG = /(<[^>]*>)/;

// A mark can't go inside an attribute, so tags, which can hold a link to the
// name, only get the masked name.
const censor = (html: string, mention: RegExp, style: RedactStyle) =>
  html
    .split(TAG)
    .map((part, index) =>
      part.replace(mention, (_, prefix: string, name: string) => {
        if (index % 2) {
          return prefix + maskName(name);
        }
        return style === "hide" ? "" : prefix + redactedHtml(name, style);
      })
    )
    .join("");

export const applyCensoring = (
  html: string,
  options: { usernames: boolean; subreddits: boolean; style: RedactStyle }
) => {
  let result = html;
  if (options.usernames) {
    result = censor(result, MENTION("u(?:ser)?"), options.style);
  }
  if (options.subreddits) {
    result = censor(result, MENTION("r"), options.style);
  }
  return result;
};
