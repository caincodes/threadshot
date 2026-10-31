# threadshot

Turn a Reddit post or comment thread into a clean, shareable screenshot.

Built with [Astro](https://astro.build) (server output, Vercel adapter),
[Tailwind CSS](https://tailwindcss.com) and a [Svelte](https://svelte.dev) island for the editor.

## Design

The app UI is deliberately plain: ink on white, one vermilion accent, 6px
radius, hairline borders, Archivo and IBM Plex Sans.

The exported image is a separate system (`.ap` in `src/styles/global.css`):
a 390px phone-width share card, exported at 3x, with large type, a compact
stats row and colour-coded reply bars. It is modelled on the share-as-image
style of Apollo for Reddit, in iOS-style light and dark palettes, set in Inter
with Phosphor icons. Fonts are self-hosted so modern-screenshot can embed them in the PNG.

## Local-only branch

This branch needs no Reddit API keys. It runs on your own computer and reads
Reddit's public pages from your own connection, so requests come from your IP.

It asks Reddit straight from your browser first, so the request carries your
browser's own user agent, headers and connection. If the browser is not allowed
to read the response (CORS) or Reddit refuses it, it falls back to the local
server, which forwards your browser's user agent. If both fail, the error says
what each attempt got. Share links (`/s/...`) are always resolved by the server,
because a browser cannot follow Reddit's redirect across origins.

```sh
git checkout local-only
npm ci
npm run dev        # then open http://localhost:4321
```

Requires Node 22.23.4+ (24 recommended).

Things to know:

- **It is a personal tool.** Reddit asks for approval before automated access,
  and reading its public pages this way may go against its terms. Keep the
  volume low, and do not run it as a service.
- **It can be blocked.** Reddit may rate limit or refuse unauthenticated
  requests (the app shows the status it got). Waiting a bit usually helps.
- **It refuses to run anywhere but localhost.** The API routes return 403 unless
  the page is addressed as `localhost` and the connection comes from the same
  machine, so a deployed copy cannot be used as an open Reddit proxy.
- The "Try a sample post" link on the home page (`/generate?sample=1`) works
  without any network access to Reddit.

`SITE_URL` is optional: the exported image's watermark can show a site host.
Leave it unset to omit that line.

## Scripts

- `npm run dev` / `npm run build` / `npm run preview`
- `npm run check` - type-check Astro, TypeScript and Svelte
- `npm run lint`

## Routes

- `/` - paste a reddit URL
- `/generate?sub=&postId=&commentId=` - the editor
- `/r/{sub}/comments/{id}/...` and `/r/{sub}/s/{code}` - reddit URLs with the
  host swapped; redirect to the editor
- `/api/reddit` - fetches a post and its comments (localhost only)
- `/api/img` - same-origin proxy for Reddit-hosted images
