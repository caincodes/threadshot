import type { APIRoute } from "astro";

import { fetchXPost, X_POST_ID, XApiError } from "../../server/x";

const json = (body: unknown, status = 200, headers: HeadersInit = {}) =>
  Response.json(body, { status, headers });

export const GET: APIRoute = async ({ url }) => {
  const id = url.searchParams.get("id") ?? "";
  if (!X_POST_ID.test(id)) {
    return json({ error: "Invalid post id" }, 400);
  }
  try {
    return json(await fetchXPost(id), 200, {
      "Cache-Control": "public, max-age=300, s-maxage=300",
    });
  } catch (error) {
    const status = error instanceof XApiError ? error.status : 502;
    return json({ error: (error as Error).message }, status);
  }
};
