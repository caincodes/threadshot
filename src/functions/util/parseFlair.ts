import type { RawFlair, RedditFlair } from "../../types/reddit";

export const parseFlair = (
  flair: RawFlair | undefined,
  textColor: string,
  backgroundColor: string
): RedditFlair | undefined => {
  if (!flair?.length) {
    return undefined;
  }

  const img = flair.find((part) => part.u)?.u;
  const text = flair
    .map((part) => part.t ?? "")
    .join("")
    .trim();

  return img || text ? { img, text, textColor, backgroundColor } : undefined;
};
