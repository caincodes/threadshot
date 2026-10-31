import { useEditorData } from "../../../../contexts/EditorContext";
import { applyCensoring } from "../../../../functions/util/censorText";
import type { MoreChildren, RedditComment } from "../../../../types/reddit";
import { Paragraph } from "../../../ui/typography";
import { Tagline } from "../tagline/Tagline";
import { ChildIndent } from "./ChildIndent";

interface CommentProps {
  data: RedditComment | MoreChildren;
}

export const Comment = ({ data }: CommentProps) => {
  const {
    isCensorSubreddits,
    isCensorUsernames,
    theme,
    replyDepth,
    commentReplies,
  } = useEditorData();

  // Anything that isn't a comment is a "more children" stub, out of scope.
  if (data.type !== "comment" || data.depth > replyDepth) {
    return null;
  }

  const {
    author,
    date,
    scoreString,
    body_html: commentBody,
    id,
    flair,
    awardCount,
    is_submitter,
  } = data;
  const depth = data.depth ? data.depth : 0;
  const body = applyCensoring(commentBody, {
    subreddits: isCensorSubreddits,
    usernames: isCensorUsernames,
  });

  return (
    <div className="flex flex-col">
      <ChildIndent depth={depth} id={id}>
        <div
          className="mb-1 flex flex-col"
          style={{ marginTop: depth === 0 ? 0 : 4 }}
        >
          <div className="flex">
            <Tagline
              censorUser={isCensorUsernames}
              count={awardCount}
              date={date}
              flair={flair}
              isSubmitter={is_submitter}
              score={scoreString}
              type="comment"
              username={author}
            />
          </div>
          <Paragraph
            dangerouslySetInnerHTML={{ __html: body }}
            style={{ color: theme.contrast[300] }}
          />
        </div>
      </ChildIndent>
      {data.replyTree.slice(0, commentReplies).map((comment) => (
        <Comment data={comment} key={comment.id} />
      ))}
    </div>
  );
};
