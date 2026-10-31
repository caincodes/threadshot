// Redaction replaces the name but keeps the "u/" or "r/" in front of it, so a
// redacted image still reads "u/REDACTED" and "r/REDACTED". Names are matched
// only when the prefix is not part of a longer word ("menu/..." is left alone),
// which also covers links such as reddit.com/u/name.
export const REDACTED = "REDACTED";

const MENTION = (prefix: string) =>
  new RegExp(`(?<!\\w)(\\/?${prefix}\\/)[\\w-]+`, "gi");

export const censorUsernames = (text: string) =>
  text.replaceAll(MENTION("u(?:ser)?"), `$1${REDACTED}`);

export const censorSubreddits = (text: string) =>
  text.replaceAll(MENTION("r"), `$1${REDACTED}`);

export const applyCensoring = (
  text: string,
  options: { usernames: boolean; subreddits: boolean }
) => {
  let result = text;
  if (options.usernames) {
    result = censorUsernames(result);
  }
  if (options.subreddits) {
    result = censorSubreddits(result);
  }
  return result;
};
