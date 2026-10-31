import { useQuery } from "@tanstack/react-query";

import { parseComments } from "../../functions/util/parseComments";
import { parseSubmission } from "../../functions/util/parseSubmission";
import type {
  CommentSort,
  ListedRawComment,
  ListedRawSubmission,
  Listing,
  MoreChildren,
  RedditComment,
  RedditSubmission,
} from "../../types/reddit";

type RedditData = [RedditSubmission, Array<RedditComment | MoreChildren>];

const fetchRedditData = async (
  subreddit: string,
  postId: string,
  commentId: string | null,
  sort: CommentSort
): Promise<RedditData> => {
  const params = new URLSearchParams({ sub: subreddit, postId, sort });
  if (commentId) {
    params.set("commentId", commentId);
  }

  const res = await fetch(`/api/reddit?${params}`);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }

  const [submissionListing, commentListing] = (await res.json()) as [
    Listing<ListedRawSubmission>,
    Listing<ListedRawComment>
  ];
  const modhash = submissionListing.data.modhash;

  return [
    parseSubmission(submissionListing.data.children[0].data, modhash),
    parseComments(commentListing.data.children, modhash),
  ];
};

export const useRedditData = (
  subreddit: string,
  postId: string,
  commentId: string | null,
  sort: CommentSort
) =>
  useQuery({
    queryKey: ["comments", subreddit, postId, commentId, sort],
    queryFn: () => fetchRedditData(subreddit, postId, commentId, sort),
    retry: false,
  });
