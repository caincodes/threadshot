# Threadshot for Safari

A toolbar button that sends the Reddit post you are reading to
[threadshot.app](https://threadshot.app). It does what the "Send to threadshot"
bookmark does, without needing the bookmarks bar.

This is not a packaged extension. It installs itself the way Safari stores
extensions made with Describe an Extension, including a row in Safari's private
database, and needs Safari 27 or later. Apple does not support this, so it can
stop working in a Safari update. It has only been tried on a Mac that has
already used Describe an Extension.

## Install

1. Give your terminal app Full Disk Access in System Settings > Privacy &
   Security, then restart it.
2. Quit Safari.
3. Run this from the repository root:

   ```sh
   extension/install.sh
   ```

4. Open Safari and turn on Threadshot in Settings > Extensions.

If the script says Safari has no extension database yet, use Describe an
Extension in Safari once, then run it again. The script keeps a copy of the
database in a folder on your Desktop.

## Use it

Open a Reddit post and click the Threadshot button in the toolbar. If Safari
blocks the pop-up, allow pop-ups for reddit.com.

## Keeping it working

Do not ask Safari to edit this extension, because that can replace the script.
If the button stops working, run `extension/install.sh` again.

## Changing it

`background.js` repeats the steps in `src/lib/bookmarklet.ts`. Change both
together, then run the install script. The site address is set at the top of the
injected script.
