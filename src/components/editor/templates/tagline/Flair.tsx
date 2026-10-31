import { darkFlairText, lightFlairText } from "../../../../styles/themes";
import type { RedditFlair } from "../../../../types/reddit";
import { Caption } from "../../../ui/typography";
import { proxiedImageSrc } from "../media/proxy";
import { BadgeContainer } from "./BadgeContainer";

export const Flair = ({ flair }: { flair: RedditFlair }) => {
  const textColor = flair.textColor === "dark" ? darkFlairText : lightFlairText;

  return (
    <BadgeContainer
      style={{
        backgroundColor: flair.backgroundColor,
        borderColor: flair.backgroundColor,
      }}
    >
      {flair.img && (
        <img
          alt="flair icon"
          className="flex size-[0.7em]"
          src={proxiedImageSrc(flair.img)}
        />
      )}
      <Caption style={{ color: textColor }}>{flair.text}</Caption>
    </BadgeContainer>
  );
};
