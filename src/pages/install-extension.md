---
layout: ../layouts/Guide.astro
title: Install the Safari extension | Threadshot for Reddit
description: How to install the Threadshot Safari extension on a Mac with Safari 27 or later.
---

# Install the Safari extension

Adds a toolbar button that sends the Reddit post you are reading to
[threadshot.app](https://threadshot.app). Same idea as the bookmark, without a
bookmarks bar.

You need Safari 27 or later on a Mac. This is not a normal App Store or signed
extension: the install script writes into Safari the way Apple's "Describe an
Extension" flow does. Apple does not officially support that path, so a Safari
update can break it.

## Install

1. Give your terminal app Full Disk Access in System Settings → Privacy &
   Security, then restart the terminal.
2. Quit Safari.
3. Run either of these:

   ```sh
   # curl: fetches only this folder, and needs no git
   curl -fsSL https://threadshot.app/extension.sh | sh
   ```

   ```sh
   # git clone
   git clone https://github.com/caincodes/threadshot && threadshot/extension/install.sh
   ```

4. Open Safari, go to Safari → Settings → Extensions, and turn on Threadshot.

If the script says Safari has no extension database yet, run Describe an
Extension in Safari once, then run the script again. The script also saves a
copy of the database in a folder on your Desktop.

## Use it

Open a Reddit post and click the Threadshot button in the toolbar. If Safari
blocks the new window, allow pop-ups for reddit.com.

If a Safari update removes the extension, run the install script again.
