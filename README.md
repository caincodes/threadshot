# post-share-web

Turn a Reddit post or comment thread into a clean, shareable screenshot.

Built with [Astro](https://astro.build) (server output, Vercel adapter),
[Tailwind CSS](https://tailwindcss.com) and a [Svelte](https://svelte.dev) island for the editor.

## Develop

Requires Node 22.23.4+ (24 recommended).

```sh
npm ci
cp .env.example .env.local   # then fill in values
npm run dev
```

| Variable               | Purpose                                         |
| ---------------------- | ----------------------------------------------- |
| `REDDIT_CLIENT_ID`     | Reddit OAuth app client ID (optional)           |
| `REDDIT_CLIENT_SECRET` | Reddit OAuth app secret (optional)              |
| `REDDIT_MOCK`          | `1` serves sample data, no Reddit access needed |

Without credentials the server tries Reddit's public JSON pages, which Reddit
often blocks (especially from cloud hosts such as Vercel).

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
