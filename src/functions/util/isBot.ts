import type { MoreChildren, RedditComment } from "../../types/reddit";

// Reddit has no "is a bot" flag, so this reads the signs bots leave: the name
// (AutoModerator, "...bot", "...-bot-..."), a flair that says bot or modbot, or
// a pinned comment that announces it was generated automatically. A real user
// whose name ends in "bot" (Talbot, Abbot) will be caught too; the editor shows
// how many comments matched so that is easy to spot.
const BOT_NAME = /(?:^|[-_])bot(?:[-_\d]|$)|bot\d*$/i;
const BOT_FLAIR = /\b(?:mod)?bot\b/i;
const BOT_NOTICE =
  /\bi am a bot\b|performed automatically|generated automatically|\bbeep boop\b/i;

export const isBotComment = (comment: RedditComment): boolean =>
  comment.author.toLowerCase() === "automoderator" ||
  BOT_NAME.test(comment.author) ||
  BOT_FLAIR.test(comment.flair?.text ?? "") ||
  (comment.stickied && BOT_NOTICE.test(comment.body_html));

type Comments = Array<RedditComment | MoreChildren>;

// Comments to show: with bots hidden, a bot comment and the replies under it go.
// Filtering happens before the "how many to show" limits, so those count only
// what is actually displayed.
export const withoutBots = (comments: Comments, hideBots: boolean): Comments =>
  hideBots
    ? comments.filter((comment) => comment.type !== "comment" || !isBotComment(comment))
    : comments;

export const countBotComments = (comments: Comments): number =>
  comments.reduce(
    (total, comment) =>
      comment.type === "comment"
        ? total + (isBotComment(comment) ? 1 : 0) + countBotComments(comment.replyTree)
        : total,
    0
  );
