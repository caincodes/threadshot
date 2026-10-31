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

## Getting a post in

Reddit refuses most requests that do not come from an approved app or a normal
page, so threadshot has two ways in, and neither uses anyone else's key.

1. **Your own Reddit app.** On first visit the app asks for a client ID (and a
   client secret, only for script or web apps). Create an app at
   [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps); an "installed
   app" needs only the client ID. The key is kept in your browser's
   `localStorage`. It is sent in the body of each request to this site's
   server over HTTPS so the server can log in to Reddit for you; the server
   keeps only a short-lived token in memory and never stores or logs the key.
   An app with no secret uses Reddit's installed-client login; with a secret it
   uses the standard app login. Reddit may need to approve your app first.
2. **The bookmark (no key).** The home page has a "Send to threadshot" button.
   Drag it to your bookmarks bar, open any Reddit post, and click it. The
   bookmark runs on reddit.com, so it reads the post's JSON as an ordinary
   same-origin load with your own session, IP and user agent, then hands it to
   this app in a new window with `postMessage`. Only pages on reddit.com can
   send data, only well-formed threads are accepted, and each click carries a
   one-time id so a window that is being replaced cannot acknowledge it by
   mistake. Sorting then happens in the browser.

The "Try a sample post" link (`/generate?sample=1`) needs neither.

## Develop

Requires Node 22.23.4+ (24 recommended).

```sh
npm ci
npm run dev        # then open http://localhost:4321
```

`SITE_URL` is optional: the exported image's watermark can show a site host. On
Vercel it is filled in at build time from the project's production domain;
elsewhere set `SITE_URL`, or leave it unset to omit that line.

## Scripts

- `npm run dev` / `npm run build` / `npm run preview`
- `npm run check` - type-check Astro, TypeScript and Svelte
- `npm run lint`

## Routes

- `/` - paste a reddit URL
- `/generate?sub=&postId=&commentId=` (or `sub=&share=`, or `sample=1`, or `from=reddit`) - the editor
- `/r/{sub}/comments/{id}/...` and `/r/{sub}/s/{code}` - reddit URLs with the
  host swapped; redirect to the editor
- `POST /api/reddit` - fetches a post and its comments with the visitor's credentials
- `POST /api/resolve` - turns a `/s/` share link into a post
- `/api/img` - same-origin proxy for Reddit-hosted images
