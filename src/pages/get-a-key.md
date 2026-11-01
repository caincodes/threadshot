---
layout: ../layouts/Guide.astro
title: Get a Reddit API key | Threadshot for Reddit
description: How to create a Reddit app and copy its client ID for threadshot.app.
---

# Get a Reddit API key

You don't need a key to use threadshot.app. A key lets you paste any Reddit
link instead of sending the post from Reddit. You only need the client ID from
an app on your own Reddit account.

1. Sign in to Reddit, then open
   [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps).
2. Click **are you a developer? create an app...** (or **create another
   app...** if you already have one).
3. Give it any name, such as threadshot.app.
4. Choose **installed app**. It has no secret, and that is all threadshot.app
   needs.
5. Enter `http://localhost` as the redirect URI. Reddit requires one;
   threadshot.app never uses it.
6. Click **create app**. Your client ID is the short string under the app's
   name. Copy it.
7. [Go back to threadshot.app](/#key) and paste it into the Client ID field.

## Which app type?

- **Preferred — Installed app:** cannot keep a secret, so Reddit gives it
  none.
- **Script:** for something running on a machine you control. It has a secret;
  paste that into threadshot.app's optional Client secret field. It only talks
  to Reddit as your account.
- **Web app:** for a service on a server you control. You don't need it here.

## Can't create an app?

Reddit may ask you to accept its Responsible Builder Policy, and may need to
approve API access before you can create an app. If you can't get a key,
[send posts without one](/#no-key) using the iOS Shortcut, Safari extension, or
bookmark. Each one reads the Reddit page you already have open.

## Reddit's documentation

- [Reddit OAuth2 documentation](https://github.com/reddit-archive/reddit/wiki/OAuth2)
  — app types, client IDs, and installed-app login.
- [Responsible Builder Policy](https://support.reddithelp.com/hc/en-us/articles/42728983564564-Responsible-Builder-Policy)
  — Reddit's rules for creating an app and using the API.
