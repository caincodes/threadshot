<script lang="ts">
  import BookmarkSimple from "phosphor-svelte/lib/BookmarkSimple";

  import { bookmarkletHref } from "../lib/bookmarklet";
  import { credentials } from "../lib/credentials.svelte";
  import Connect from "./Connect.svelte";

  const POST_PATH = /^\/r\/([\w-]+)\/comments\/(\w+)(?:\/[^/]*)?(?:\/(\w+))?/;
  const SHARE_PATH = /^\/r\/([\w-]+)\/s\/([\w-]+)/;

  type Mode = "key" | "bookmark";

  const OPTIONS: { id: Mode; title: string; description: string }[] = [
    {
      id: "key",
      title: "I have a Reddit key",
      description: "Paste your app's client ID, then load any post by link.",
    },
    {
      id: "bookmark",
      title: "I don't have a key",
      description:
        "Use a bookmark that sends a post from Reddit to threadshot.app. No sign-up.",
    },
  ];

  // Links to "/#bookmark" (from the key form, the guide, error screens) open
  // the bookmark option directly.
  let mode = $state<Mode>(
    window.location.hash === "#bookmark" ? "bookmark" : "key"
  );

  const choose = (next: Mode) => {
    mode = next;
    history.replaceState(
      null,
      "",
      next === "bookmark" ? "#bookmark" : window.location.pathname
    );
  };

  $effect(() => {
    const onHashChange = () => {
      mode = window.location.hash === "#bookmark" ? "bookmark" : "key";
    };
    window.addEventListener("hashchange", onHashChange);
    // The island renders after load, so the browser could not scroll to it.
    if (window.location.hash === "#bookmark") {
      document.getElementById("bookmark")?.scrollIntoView();
    }
    return () => window.removeEventListener("hashchange", onHashChange);
  });

  let link = $state("");
  let error = $state("");

  const isConnected = $derived(credentials.value !== null);
  const bookmark = bookmarkletHref(window.location.origin);

  const go = (event: SubmitEvent) => {
    event.preventDefault();
    error = "";
    const value = link.trim();
    if (!value) {
      error = "Paste a Reddit link first.";
      return;
    }

    let pathname: string;
    try {
      ({ pathname } = new URL(value));
    } catch {
      error = "That does not look like a Reddit post or comment link.";
      return;
    }

    const post = POST_PATH.exec(pathname);
    const share = SHARE_PATH.exec(pathname);
    const params = new URLSearchParams();
    if (post) {
      params.set("sub", post[1]);
      params.set("postId", post[2]);
      if (post[3]) params.set("commentId", post[3]);
    } else if (share) {
      params.set("sub", share[1]);
      params.set("share", share[2]);
    } else {
      error = "That does not look like a Reddit post or comment link.";
      return;
    }
    window.location.href = `/generate?${params}`;
  };
</script>

<div id="bookmark" class="mt-8 flex flex-col gap-5">
  <div
    class="grid gap-3 sm:grid-cols-2"
    aria-label="How do you want to start?"
    role="radiogroup"
  >
    {#each OPTIONS as option (option.id)}
      <button
        class={[
          "flex min-h-11 flex-col gap-1 border-2 p-4 text-left transition-colors duration-150",
          mode === option.id ? "border-ink" : "border-line hover:border-ink-2",
        ]}
        aria-checked={mode === option.id}
        onclick={() => choose(option.id)}
        role="radio"
        type="button"
      >
        <span class="font-semibold">{option.title}</span>
        <span class="text-sm text-ink-2">{option.description}</span>
      </button>
    {/each}
  </div>

  {#if mode === "key"}
    <Connect />

    <!-- The link field appears once a key is saved, so the key form is the
         only step until then. -->
    {#if isConnected}
      <form class="flex flex-col gap-3" onsubmit={go} novalidate>
        <label class="text-sm font-semibold" for="url-input">
          Reddit post or comment link
        </label>
        <input
          id="url-input"
          class="field"
          aria-describedby="url-error"
          autocapitalize="off"
          autocomplete="off"
          bind:value={link}
          inputmode="url"
          placeholder="https://www.reddit.com/r/woodworking/comments/..."
          spellcheck="false"
          type="text"
        />
        {#if error}
          <p id="url-error" class="text-sm font-medium text-accent" role="alert">
            {error}
          </p>
        {/if}
        <button class="btn btn-primary self-start" type="submit">
          Generate screenshot
        </button>
      </form>
    {/if}
  {:else}
    <section class="flex flex-col gap-4 border border-line p-4">
      <p class="text-ink-2">
        Reddit now approves API keys by hand, so you may not have one. This
        bookmark reads a post from the Reddit page you are already viewing, then
        sends it here. It needs no key.
      </p>
      <ol class="list-decimal space-y-1 pl-5">
        <li>Drag the button below up to your bookmarks bar.</li>
        <li>Open any Reddit post.</li>
        <li>Click the bookmark.</li>
      </ol>
      <a
        class="btn btn-primary self-start"
        draggable="true"
        href={bookmark}
      >
        <BookmarkSimple size={20} weight="bold" />
        Send to threadshot.app
      </a>
      <p class="text-sm text-ink-2">
        Can't see your bookmarks bar? Press Ctrl+Shift+B (Cmd+Shift+B on a Mac)
        to show it. Have a key after all?
        <button class="link" onclick={() => choose("key")} type="button">
          Use it instead
        </button>.
      </p>
    </section>
  {/if}

  <p class="text-sm text-ink-2">
    Just looking? <a class="link" href="/generate?sample=1">Try a sample post</a>
  </p>
</div>
