import { useEditorData } from "../../../../contexts/EditorContext";
import { applyCensoring } from "../../../../functions/util/censorText";
import type { RedditSubmission } from "../../../../types/reddit";
import { Paragraph } from "../../../ui/typography";

interface SelfTextProps {
  submission: RedditSubmission;
}

export const SelfText = ({ submission }: SelfTextProps) => {
  const { theme, isCensorSubreddits, isCensorUsernames } = useEditorData();
  const { selftext_html } = submission;

  if (!selftext_html) {
    return null;
  }

  const body = applyCensoring(selftext_html, {
    subreddits: isCensorSubreddits,
    usernames: isCensorUsernames,
  });

  return (
    <div
      className="flex max-w-full rounded-lg border p-2"
      style={{
        backgroundColor: theme.background["100"],
        borderColor: theme.background["300"],
      }}
    >
      <Paragraph
        dangerouslySetInnerHTML={{ __html: body }}
        style={{ color: theme.contrast[300] }}
      />
    </div>
  );
};
