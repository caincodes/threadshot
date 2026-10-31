// Hues for Reddit's default avatar colours. The name picks one, so a person
// keeps the same colour throughout.
const HUES = [172, 18, 330, 205, 265, 45, 0, 110];

export const defaultAvatarHue = (name: string) => {
  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return HUES[hash % HUES.length];
};
