import type { APIRoute } from "astro";

import {
  CredentialsError,
  explainStatus,
  isSameOrigin,
  parseCredentials,
  redditFetch,
} from "../../server/reddit";

const SAFE = /^[\w-]+$/;
const SORTS = new Set(["best", "confidence", "top", "new", "controversial", "old", "qa", "random"]);

const json = (body: unknown, status = 200) => Response.json(body, { status });

// POST, not GET, so the visitor's credentials travel in the body and never end
// up in a URL, an access log or the browser history.
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

  const { sub, postId, commentId, sort = "confidence" } = body as Record<string, string | undefined>;
  if (
    !sub ||
    !postId ||
    !SAFE.test(sub) ||
    !SAFE.test(postId) ||
    (commentId && !SAFE.test(commentId)) ||
    !SORTS.has(sort)
  ) {
    return json({ error: "Invalid parameters" }, 400);
  }

  try {
    const credentials = parseCredentials(body.credentials);
    const path = commentId
      ? `/r/${sub}/comments/${postId}/title/${commentId}.json?context=10000&raw_json=1&sort=${sort}`
      : `/r/${sub}/comments/${postId}/.json?raw_json=1&sort=${sort}`;
    const upstream = await redditFetch(path, credentials);

    if (!upstream.ok) {
      return json({ error: explainStatus(upstream.status) }, upstream.status === 404 ? 404 : 502);
    }
    return new Response(await upstream.text(), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof CredentialsError) {
      return json({ error: error.message, code: "credentials" }, 401);
    }
    return json({ error: (error as Error).message }, 502);
  }
};
