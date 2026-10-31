// Reddit's own placeholder (the coloured alien) for people without a picture.
// The name picks the colour, so a person keeps the same one throughout.
const DEFAULT_AVATARS = 8;

export const defaultAvatar = (name: string) => {
  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return `https://www.redditstatic.com/avatars/defaults/v2/avatar_default_${hash % DEFAULT_AVATARS}.png`;
};
