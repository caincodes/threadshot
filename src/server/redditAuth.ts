import {
  REDDIT_CLIENT_ID,
  REDDIT_CLIENT_SECRET,
  REDDIT_MOCK,
} from "astro:env/server";

export const USER_AGENT =
  "web:post-share-web:2.0.0 (personal screenshot tool)";

export const isMockMode = REDDIT_MOCK === "1";

let cached: { token: string; expiresAt: number } | null = null;

export const hasRedditCredentials = () =>
  Boolean(REDDIT_CLIENT_ID && REDDIT_CLIENT_SECRET);

const getRedditToken = async (): Promise<string> => {
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.token;
  }

  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    throw new Error(`Reddit token request failed: ${res.status}`);
  }
  const json = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  cached = {
    token: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return cached.token;
};

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
