# Threadshot for Safari

End-user install steps live on the site:
[threadshot.app/install-extension](https://threadshot.app/install-extension).

This folder is the extension source and the install scripts those steps run.

## Layout

- `install.sh` / `../public/extension.sh` — install into Safari's extension
  database (Safari 27+, Full Disk Access for the terminal, Safari quit).
- `background.js` — toolbar button; mirrors `src/lib/bookmarklet.ts`. Change
  both together, then re-run the install script. The site address is set at the
  top of the injected script.
