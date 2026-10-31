import { useEditorData } from "../../contexts/EditorContext";
import type {
  MoreChildren,
  RedditComment,
  RedditSubmission,
} from "../../types/reddit";
import { cx } from "../../lib/cx";
import { Spinner } from "../ui/PrimaryButton";
import { Paragraph, Title } from "../ui/typography";
import { CommentHeader } from "./CommentHeader";
import { RootComment } from "./templates/comments/RootComment";
import { Submission } from "./templates/submissions/Submission";
import { Attribution } from "./Attribution";

interface EditorCanvasProps {
  isLoading: boolean;
  isError: boolean;
  submission: RedditSubmission | undefined;
  comments: (RedditComment | MoreChildren)[] | undefined;
}

export const EditorCanvas = ({
  submission,
  comments,
  isLoading,
  isError,
}: EditorCanvasProps) => {
  const { theme, showComments, topLevelComments } = useEditorData();
  const isReady = !isLoading && !isError;
  const commentsBeingShown = Boolean(comments?.length && showComments);

  return (
    <div className="flex max-w-screen flex-col items-center rounded-lg">
      <Title className="h-8">Image Preview</Title>
      <div
        className={cx(
          "flex h-full max-h-[calc(100vh-96px-32px)] text-left",
          isReady ? "items-start justify-start" : "items-center justify-center"
        )}
        id="reddit-preview"
        style={{ backgroundColor: theme.background["100"] }}
      >
        <div className="flex flex-col gap-2">
          {submission && (
            <>
              <Submission
                commentsBeingShown={commentsBeingShown}
                submission={submission}
              />
              <Attribution />
            </>
          )}
          {comments && showComments && (
            <>
              <CommentHeader />
              {comments.slice(0, topLevelComments).map((comment) => (
                <RootComment data={comment} key={comment.id} />
              ))}
            </>
          )}
        </div>
        {isLoading && <Spinner />}
        {isError && (
          <Paragraph style={{ color: theme.accents[100] }}>
            Something went wrong 😔
          </Paragraph>
        )}
      </div>
    </div>
  );
};
