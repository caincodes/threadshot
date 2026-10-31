<script lang="ts">
  import { bookmarkletHref } from "../lib/bookmarklet";
  import { credentials } from "../lib/credentials.svelte";
  import Connect from "./Connect.svelte";

  const POST_PATH = /^\/r\/([\w-]+)\/comments\/(\w+)(?:\/[^/]*)?(?:\/(\w+))?/;
  const SHARE_PATH = /^\/r\/([\w-]+)\/s\/([\w-]+)/;

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

<div class="mt-8 flex flex-col gap-6">
  <Connect />

  <form class="flex flex-col gap-3" onsubmit={go} novalidate>
    <label class="text-sm font-semibold" for="url-input">
      Reddit post or comment link
    </label>
    <input
      id="url-input"
      class="field disabled:cursor-not-allowed disabled:bg-canvas"
      aria-describedby="url-error"
      autocapitalize="off"
      autocomplete="off"
      bind:value={link}
      disabled={!isConnected}
      inputmode="url"
      placeholder="https://www.reddit.com/r/woodworking/comments/..."
      spellcheck="false"
      type="text"
    />
    <p class="text-sm text-ink-2">
      {#if isConnected}
        No link handy? <a class="link" href="/generate?sample=1">Try a sample post</a>
      {:else}
        Connect your Reddit app first, or
        <a class="link" href="#bookmark">use the bookmark</a>. You can also
        <a class="link" href="/generate?sample=1">try a sample post</a>.
      {/if}
    </p>
    <p
      id="url-error"
      class="min-h-5 text-sm font-medium text-accent"
      role="alert"
    >
      {error}
    </p>
    <button class="btn btn-primary self-start" disabled={!isConnected} type="submit">
      Generate screenshot
    </button>
  </form>

  <section id="bookmark" class="border-t border-line pt-6">
    <h2 class="font-display text-xl font-extrabold tracking-[-0.02em]">
      No Reddit app? Use the bookmark
    </h2>
    <p class="mt-2 text-ink-2">
      Reddit now approves API keys by hand, so you may not have one. This
      bookmark reads a post from the Reddit page you are already viewing, then
      sends it here. It needs no key.
    </p>
    <ol class="mt-3 list-decimal space-y-1 pl-5 text-ink-2">
      <li>Drag the button below to your bookmarks bar.</li>
      <li>Open any Reddit post.</li>
      <li>Click the bookmark.</li>
    </ol>
    <a class="btn btn-secondary mt-4" draggable="true" href={bookmark}>
      Send to threadshot
    </a>
  </section>
</div>
