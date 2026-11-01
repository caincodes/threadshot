# threadshot.app

Turn a Reddit post or comment thread into a clean, shareable screenshot at
[threadshot.app](https://threadshot.app).

threadshot.app is a fork of [shareddit](https://github.com/logankuzyk/shareddit)
by [Logan Kuzyk](https://github.com/logankuzyk), who created the project and
built it through 2021 and 2022. This fork picks up where shareddit left off,
bringing the idea back online with a new stack and a new name. See
[Credits](#credits).

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
page, so nothing here uses anyone else's key. No key is the default: the home
page lists three ways to send a post, with the one that fits the visitor's
device first (`src/lib/device.ts`). All three read the post from the Reddit page
you have open, as an ordinary same-origin load with your own session, IP and
user agent.

1. **The iOS Shortcut.** iOS Safari won't run bookmarks like this, so iPhones
   and iPads get a Share sheet shortcut. It opens the editor in the same tab
   with the compressed thread in the URL fragment, which is never sent to a
   server. A link can't prove where it came from, so thread HTML is sanitized
   before it is shown. Rebuild `public/threadshot.shortcut` with
   `node scripts/build-shortcut.mjs` on a Mac.
2. **The Safari extension.** A toolbar button for Safari on a Mac, installed
   with a script. See [threadshot.app/install-extension](https://threadshot.app/install-extension)
   (source in [extension/](extension/)).
3. **The bookmark.** For every other desktop browser, including on Windows. Drag
   the "Send to threadshot.app" button to your bookmarks bar, open any Reddit
   post, and click it.

The bookmark and the extension hand the thread to this app in a new window with
`postMessage`. Only pages on reddit.com can send data, only well-formed threads
are accepted, and each click carries a one-time id so a window that is being
replaced cannot acknowledge it by mistake. Sorting then happens in the browser.

**Your own Reddit app** is the separate option for the few who have a key. The
home page asks for a client ID (and a client secret, only for script or web
apps). Create an app at
[reddit.com/prefs/apps](https://www.reddit.com/prefs/apps); an "installed app"
needs only the client ID. The key is kept in your browser's `localStorage`. It is
sent in the body of each request to this site's server over HTTPS so the server
can log in to Reddit for you; the server keeps only a short-lived token in memory
and never stores or logs the key. An app with no secret uses Reddit's
installed-client login; with a secret it uses the standard app login. Reddit may
need to approve your app first.

The "Try a sample post" link (`/generate?sample=1`) needs neither.

## Develop

Requires Node 22.23.4+ (24 recommended).

```sh
npm ci
npm run dev        # then open http://localhost:4321
```

`SITE_URL` is optional. Canonical links point at threadshot.app; set `SITE_URL`
to override that for a fork or a staging copy.

## Versions

The version in the footer is counted from conventional commits at build time
(`scripts/version.mjs`), so it is never set by hand. The first commit of this
fork is v2.0.0. After that, a breaking change bumps the major number, `feat` and
`fix` bump the minor, and anything else bumps the patch. As in semver, a bump
resets the numbers to its right, and merge commits don't count. Run
`node scripts/version.mjs` to print the current version.

If the checkout has only part of the history, as a Vercel build may, the script
clones the commits from GitHub to count them. If that fails too, the footer
shows the commit without a version.

## Scripts

- `npm run dev` / `npm run build` / `npm run preview`
- `npm run check` - type-check Astro, TypeScript and Svelte
- `npm run lint`

## Routes

- `/` - choose how to send a post; `/#no-key`, `/#shortcut`, `/#extension`,
  `/#bookmark` and `/#key` open an option
- `/get-a-key` - how to create a Reddit app and copy its client ID
- `/install-extension` - how to install the Safari extension
- `/generate?sub=&postId=&commentId=` (or `sub=&share=`, or `sample=1`, or `from=reddit`) - the editor
- `/r/{sub}/comments/{id}/...` and `/r/{sub}/s/{code}` - reddit URLs with the
  host swapped; redirect to the editor
- `POST /api/reddit` - fetches a post and its comments with the visitor's credentials
- `POST /api/resolve` - turns a `/s/` share link into a post
- `/api/img` - same-origin proxy for Reddit-hosted images

## Credits

threadshot.app would not exist without
[shareddit](https://github.com/logankuzyk/shareddit). Logan Kuzyk came up with
the idea and wrote the original app, and their commits are preserved in this
repository's history. Thanks, Logan.

This project is released under the MIT License. The original copyright notice
is kept in [LICENSE](LICENSE).
