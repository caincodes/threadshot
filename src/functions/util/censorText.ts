export const censorUsernames = (text: string) => {
  const usernames = /(\/u\/\w+)+/g;

  return text.replaceAll(usernames, "[a redditor]");
};

export const censorSubreddits = (text: string) => {
  const subreddits = /(\/r\/\w+)+/g;

  return text.replaceAll(subreddits, "[a subreddit]");
};

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
