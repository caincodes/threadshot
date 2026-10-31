// Local-only mode: no API keys. Requests go to Reddit's public JSON pages
// straight from the machine running this server, using that machine's IP and
// the user agent of the browser that is talking to localhost.

// Used only if the incoming request carries no user agent at all.
const FALLBACK_USER_AGENT = "threadshot-local/2.0 (personal use on localhost)";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]"]);
const LOOPBACK_ADDRESSES = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);

export class NotLocalError extends Error {
  constructor() {
    super(
      "This build only runs on localhost. Run it on your own computer with `npm run dev`."
    );
  }
}

export class RedditBlockedError extends Error {
  constructor(readonly status: number) {
    super(
      `Reddit blocked this request (${status}). This mode reads Reddit's public pages from your own connection, so it can be rate limited. Wait a bit and try again.`
    );
  }
}

// Fails closed: the page must be addressed as localhost AND the connection
// must come from the loopback interface. Checking both stops a deployed copy
// from being used as an open Reddit proxy, even with a forged Host header.
export const assertLocal = (url: URL, getClientAddress: () => string) => {
  let address: string | undefined;
  try {
    address = getClientAddress();
  } catch {
    address = undefined;
  }
  if (
    !LOCAL_HOSTNAMES.has(url.hostname) ||
    !address ||
    !LOOPBACK_ADDRESSES.has(address)
  ) {
    throw new NotLocalError();
  }
};

export const userAgentOf = (request: Request) =>
  request.headers.get("user-agent") || FALLBACK_USER_AGENT;

export const redditFetch = (
  path: string,
  options: { userAgent: string; redirect?: "manual" }
): Promise<Response> =>
  fetch(`https://www.reddit.com${path}`, {
    redirect: options.redirect,
    headers: { "User-Agent": options.userAgent, Accept: "application/json" },
  });
