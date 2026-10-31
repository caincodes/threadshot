import type { APIRoute } from "astro";

import {
  CredentialsError,
  isSameOrigin,
  parseCredentials,
} from "../../server/reddit";
import { resolveShareLink } from "../../server/resolveShare";

const SAFE = /^[\w-]+$/;

const json = (body: unknown, status = 200) => Response.json(body, { status });

// Turns a reddit.com/r/{sub}/s/{code} share link into a post. It needs the
// visitor's credentials, so it is a POST like /api/reddit.
export const POST: APIRoute = async ({ request, url }) => {
  if (!isSameOrigin(request, url)) {
    return json({ error: "Cross-site requests are not allowed." }, 403);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const { sub, code } = body as Record<string, string | undefined>;
  if (!sub || !code || !SAFE.test(sub) || !SAFE.test(code)) {
    return json({ error: "Invalid parameters" }, 400);
  }

  try {
    const resolved = await resolveShareLink(sub, code, parseCredentials(body.credentials));
    return resolved
      ? json(resolved)
      : json({ error: "Could not resolve that Reddit share link." }, 404);
  } catch (error) {
    if (error instanceof CredentialsError) {
      return json({ error: error.message, code: "credentials" }, 401);
    }
    return json({ error: (error as Error).message }, 502);
  }
};
