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

## Develop

Requires Node 22.23.4+ (24 recommended).

```sh
npm ci
cp .env.example .env.local   # then fill in values
npm run dev
```

| Variable               | Purpose                                         |
| ---------------------- | ----------------------------------------------- |
| `REDDIT_CLIENT_ID`     | Reddit OAuth app client ID                      |
| `REDDIT_CLIENT_SECRET` | Reddit OAuth app secret                         |

`SITE_URL` is optional: the exported image's watermark shows the site's host
(e.g. `threadshot-for-reddit.vercel.app`). On Vercel it is filled in at build
time from the project's production domain; elsewhere set `SITE_URL`.

Both Reddit keys are required to load real posts; without them the app shows an error.
The "Try a sample post" link on the home page (`/generate?sample=1`) works
without credentials and shows a bundled sample thread.

## Scripts

- `npm run dev` / `npm run build` / `npm run preview`
- `npm run check` - type-check Astro, TypeScript and Svelte
- `npm run lint`

## Routes

- `/` - paste a reddit URL
- `/generate?sub=&postId=&commentId=` - the editor
- `/r/{sub}/comments/{id}/...` and `/r/{sub}/s/{code}` - reddit URLs with the
  host swapped; redirect to the editor
- `/api/reddit` - fetches a post and its comments
- `/api/img` - same-origin proxy for Reddit-hosted images
