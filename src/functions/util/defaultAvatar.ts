// Colours for Reddit's default avatar, generated from the name so a person
// keeps the same ones throughout. Lightness is adjusted until the outline has
// at least 3:1 contrast with the background (WCAG's minimum for graphics) and
// stays visible on the body.

export interface AvatarColors {
  background: string;
  fill: string;
  line: string;
}

const MIN_BACKGROUND_LUMINANCE = 0.35;
const MIN_FILL_CONTRAST = 1.6;
const MIN_LINE_CONTRAST = 3;
const MIN_LINE_ON_FILL_CONTRAST = 1.8;

const hash = (name: string) => {
  let value = 0;
  for (const char of name) {
    value = (Math.imul(value, 31) + char.charCodeAt(0)) >>> 0;
  }
  return value;
};

// HSL (0-360, 0-100, 0-100) to sRGB channels from 0 to 1.
const toRgb = (hue: number, saturation: number, lightness: number) => {
  const sat = saturation / 100;
  const light = lightness / 100;
  const channel = (offset: number) => {
    const step = (offset + hue / 30) % 12;
    return (
      light -
      sat *
        Math.min(light, 1 - light) *
        Math.max(-1, Math.min(step - 3, 9 - step, 1))
    );
  };
  return [channel(0), channel(8), channel(4)];
};

const luminance = (rgb: number[]) => {
  const [red, green, blue] = rgb.map((value) =>
    value <= 0.040_45 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

const contrast = (first: number, second: number) =>
  (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);

const toHex = (rgb: number[]) =>
  `#${rgb
    .map((value) =>
      Math.round(value * 255)
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;

export const defaultAvatarColors = (name: string): AvatarColors => {
  const seed = hash(name);
  const hue = seed % 360;
  const saturation = 40 + ((seed >>> 9) % 31);
  let lightness = 45 + ((seed >>> 16) % 16);

  // Rounded to whole 8-bit values first, so the checks measure the final colour.
  const shade = (light: number) =>
    toRgb(hue, saturation, Math.max(0, light)).map(
      (value) => Math.round(value * 255) / 255
    );
  while (luminance(shade(lightness)) < MIN_BACKGROUND_LUMINANCE) {
    lightness += 1;
  }
  const background = shade(lightness);
  const backgroundLum = luminance(background);

  let fillLightness = lightness * 0.71;
  while (
    fillLightness > 0 &&
    contrast(backgroundLum, luminance(shade(fillLightness))) < MIN_FILL_CONTRAST
  ) {
    fillLightness -= 1;
  }
  const fill = shade(fillLightness);
  const fillLum = luminance(fill);

  let lineLightness = lightness * 0.44;
  while (
    lineLightness > 0 &&
    (contrast(backgroundLum, luminance(shade(lineLightness))) <
      MIN_LINE_CONTRAST ||
      contrast(fillLum, luminance(shade(lineLightness))) <
        MIN_LINE_ON_FILL_CONTRAST)
  ) {
    lineLightness -= 1;
  }

  return {
    background: toHex(background),
    fill: toHex(fill),
    line: toHex(shade(lineLightness)),
  };
};
