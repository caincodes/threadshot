import uniqolor from "uniqolor";

import { useEditorData } from "../../../../contexts/EditorContext";
import type { RedditFlair } from "../../../../types/reddit";
import { Caption } from "../../../ui/typography";
import { Awards } from "./Awards";
import { BadgeContainer } from "./BadgeContainer";
import { Flair } from "./Flair";

interface TaglineProps {
  type: "submission" | "comment";
  username: string;
  score: string;
  date: string;
  subreddit?: string;
  flair?: RedditFlair;
  count: number;
  isSubmitter?: boolean;
  censorUser: boolean;
  censorSubreddit?: boolean;
}

const Dot = () => <Caption>{"•"}</Caption>;

export const Tagline = ({
  username,
  score,
  date,
  subreddit,
  flair,
  count,
  isSubmitter,
  censorUser,
  censorSubreddit = false,
}: TaglineProps) => {
  const { theme } = useEditorData();

  return (
    <div
      className="flex flex-row flex-wrap items-center gap-1"
      style={{ color: theme.contrast[100] }}
    >
      {!censorUser ? (
        <Caption bold>{username}</Caption>
      ) : (
        <div
          className="h-4 w-12 rounded"
          style={{ backgroundColor: uniqolor(username).color }}
        />
      )}
      <Dot />
      {isSubmitter && (
        <>
          <BadgeContainer style={{ backgroundColor: theme.special.highlight }}>
            <Caption>OP</Caption>
          </BadgeContainer>
          <Dot />
        </>
      )}
      {flair && (
        <>
          <Flair flair={flair} />
          <Dot />
        </>
      )}
      <Caption>{score}</Caption>
      <Dot />
      <Caption>{date}</Caption>
      {subreddit && (
        <>
          <Dot />
          <Caption>{censorSubreddit ? "a subreddit" : subreddit}</Caption>
        </>
      )}
      {count !== 0 && (
        <>
          <Dot />
          <Awards count={count} />
        </>
      )}
    </div>
  );
};
