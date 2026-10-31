import { checkCredentials } from "../lib/credentialRules";

// Visitors bring their own Reddit app. Their credentials arrive with each
// request, are used to get a token, and are never stored or logged here; only
// the short-lived token is cached in memory, under a hash of the credentials.

export const USER_AGENT = "web:threadshot:2.0.0 (visitor-supplied credentials)";

export interface RedditCredentials {
  clientId: string;
  clientSecret?: string;
}

// The credentials are missing, malformed or rejected by Reddit.
export class CredentialsError extends Error {}

export class RedditApiError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
  }
}

export const parseCredentials = (value: unknown): RedditCredentials => {
  const { clientId, clientSecret } = (value ?? {}) as Record<string, unknown>;
  if (typeof clientId !== "string") {
    throw new CredentialsError("Add your Reddit client ID first.");
  }
  const secret = typeof clientSecret === "string" && clientSecret ? clientSecret : undefined;
  const problem = checkCredentials(clientId, secret);
  if (problem) {
    throw new CredentialsError(problem);
  }
  return { clientId, clientSecret: secret };
};

const tokens = new Map<string, { token: string; expiresAt: number }>();
const MAX_CACHED_TOKENS = 200;

const tokenKey = async ({ clientId, clientSecret }: RedditCredentials) => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${clientId}:${clientSecret ?? ""}`)
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

// An app with a secret (script or web) uses the standard app login. An
// installed app has no secret, so it uses Reddit's installed-client login.
const requestToken = async (credentials: RedditCredentials) => {
  const body = credentials.clientSecret
    ? "grant_type=client_credentials"
    : "grant_type=https%3A%2F%2Foauth.reddit.com%2Fgrants%2Finstalled_client&device_id=DO_NOT_TRACK_THIS_DEVICE";

  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${credentials.clientId}:${credentials.clientSecret ?? ""}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body,
  });

  if (res.status === 401 || res.status === 403) {
    throw new CredentialsError(
      "Reddit rejected that client ID or secret. Check them at reddit.com/prefs/apps."
    );
  }
  if (!res.ok) {
    throw new RedditApiError(res.status, `Reddit's login returned ${res.status}.`);
  }

  const json = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
  };
  if (!json.access_token) {
    throw new CredentialsError(
      `Reddit did not accept those credentials${json.error ? ` (${json.error})` : ""}.`
    );
  }
  return { token: json.access_token, expiresIn: json.expires_in ?? 3600 };
};

const getToken = async (credentials: RedditCredentials, fresh = false) => {
  const key = await tokenKey(credentials);
  const cached = tokens.get(key);
  if (!fresh && cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.token;
  }

  const { token, expiresIn } = await requestToken(credentials);
  if (tokens.size >= MAX_CACHED_TOKENS) {
    tokens.delete(tokens.keys().next().value as string);
  }
  tokens.set(key, { token, expiresAt: Date.now() + expiresIn * 1000 });
  return token;
};

export const redditFetch = async (
  path: string,
  credentials: RedditCredentials,
  options: { redirect?: "manual" } = {}
): Promise<Response> => {
  const call = async (fresh: boolean) =>
    fetch(`https://oauth.reddit.com${path}`, {
      redirect: options.redirect,
      headers: {
        Authorization: `Bearer ${await getToken(credentials, fresh)}`,
        "User-Agent": USER_AGENT,
      },
    });

  const res = await call(false);
  // The cached token may have been revoked or expired early; retry once.
  return res.status === 401 ? call(true) : res;
};

// Reddit's refusals, in words a visitor can act on.
export const explainStatus = (status: number): string => {
  if (status === 401 || status === 403) {
    return `Reddit refused this app's access to that post (${status}). The post may be private or quarantined, or your app may not be allowed to read it.`;
  }
  if (status === 404) {
    return "Reddit could not find that post.";
  }
  if (status === 429) {
    return "Reddit is rate limiting your app (429). Wait a minute and try again.";
  }
  return `Reddit returned ${status}.`;
};

// Only the page that is being served may call the API, so another site cannot
// use this server to send visitors' credentials anywhere.
export const isSameOrigin = (request: Request, url: URL) => {
  const origin = request.headers.get("origin");
  return !origin || origin === url.origin;
};
