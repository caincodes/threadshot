import { useEditorData } from "../../../../contexts/EditorContext";
import type { RedditSubmission } from "../../../../types/reddit";
import { Title } from "../../../ui/typography";
import { Tagline } from "../tagline/Tagline";
import { SubmissionContent } from "./SubmissionContent";

interface SubmissionCardProps {
  submission: RedditSubmission;
  commentsBeingShown: boolean;
}

export const Submission = ({
  submission,
  commentsBeingShown,
}: SubmissionCardProps) => {
  const { theme, isCensorUsernames, isCensorSubreddits } = useEditorData();
  const {
    title,
    author,
    subreddit_name_prefixed,
    date,
    scoreString,
    userFlair,
    awardCount,
  } = submission;

  return (
    <div
      className="flex flex-col gap-2 px-[18px]"
      style={{ paddingBottom: commentsBeingShown ? 0 : 16 }}
    >
      <Title style={{ color: theme.contrast[300] }}>{title}</Title>
      <Tagline
        censorSubreddit={isCensorSubreddits}
        censorUser={isCensorUsernames}
        count={awardCount}
        date={date}
        flair={userFlair}
        score={scoreString}
        subreddit={subreddit_name_prefixed}
        type="submission"
        username={author}
      />
      <SubmissionContent submission={submission} />
    </div>
  );
};
