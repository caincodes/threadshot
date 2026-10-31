const USER_AGENT = "web:post-share-web:1.6.0 (personal screenshot tool)";

let cached: { token: string; expiresAt: number } | null = null;

export const redditUserAgent = USER_AGENT;

export const getRedditToken = async (): Promise<string> => {
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.token;
  }

  const id = process.env.REDDIT_CLIENT_ID;
  const secret = process.env.REDDIT_CLIENT_SECRET;
  if (!id || !secret) {
    throw new Error("REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET must be set");
  }

  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    throw new Error(`Reddit token request failed: ${res.status}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cached = {
    token: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return cached.token;
};

export const hasRedditCredentials = () =>
  Boolean(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET);

// Uses the OAuth API when credentials are configured, otherwise falls back to
// Reddit's public JSON pages. The fallback is best-effort: Reddit may block it.
export const redditFetch = async (
  path: string,
  init: { redirect?: "manual" } = {}
): Promise<Response> => {
  if (hasRedditCredentials()) {
    const token = await getRedditToken();
    return fetch(`https://oauth.reddit.com${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, "User-Agent": USER_AGENT },
    });
  }
  return fetch(`https://www.reddit.com${path}`, {
    ...init,
    headers: { "User-Agent": USER_AGENT },
  });
};
