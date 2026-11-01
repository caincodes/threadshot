import type { APIRoute } from "astro";

import {
  CredentialsError,
  isSameOrigin,
  parseCredentials,
  redditFetch,
} from "../../server/reddit";

const ACCOUNT_ID = /^t2_[a-z0-9]+$/i;
const MAX_IDS = 500;
const BATCH = 100;

const json = (body: unknown, status = 200) => Response.json(body, { status });

// Profile pictures for a thread's authors, as { t2_id: url }.
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

  const { ids } = body;
  if (
    !Array.isArray(ids) ||
    ids.length > MAX_IDS ||
    !ids.every((id) => typeof id === "string" && ACCOUNT_ID.test(id))
  ) {
    return json({ error: "Invalid parameters" }, 400);
  }

  try {
    const credentials = parseCredentials(body.credentials);
    const batches: string[][] = [];
    for (let i = 0; i < ids.length; i += BATCH) {
      batches.push(ids.slice(i, i + BATCH));
    }

    const icons: Record<string, string> = {};
    await Promise.all(
      batches.map(async (batch) => {
        const upstream = await redditFetch(
          `/api/user_data_by_account_ids?ids=${batch.join(",")}`,
          credentials
        );
        if (!upstream.ok) {
          return;
        }
        const users = (await upstream.json()) as Record<
          string,
          { profile_img?: string; icon_img?: string }
        >;
        for (const [id, user] of Object.entries(users ?? {})) {
          const picture = user?.profile_img || user?.icon_img;
          if (picture?.startsWith("https://")) {
            icons[id] = picture.replaceAll("&amp;", "&");
          }
        }
      })
    );
    return json(icons);
  } catch (error) {
    if (error instanceof CredentialsError) {
      return json({ error: error.message, code: "credentials" }, 401);
    }
    return json({ error: (error as Error).message }, 502);
  }
};
