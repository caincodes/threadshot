import type { MoreChildren, RedditComment } from "../../../../types/reddit";
import { Comment } from "./Comment";

interface RootCommentProps {
  data: RedditComment | MoreChildren;
}

export const RootComment = ({ data }: RootCommentProps) => (
  <div className="flex px-[18px] pb-1">
    <Comment data={data} />
  </div>
);
