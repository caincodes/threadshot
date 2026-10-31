<script lang="ts">
  import ArrowSquareOut from "phosphor-svelte/lib/ArrowSquareOut";
  import BookmarkSimple from "phosphor-svelte/lib/BookmarkSimple";
  import CaretDown from "phosphor-svelte/lib/CaretDown";
  import Check from "phosphor-svelte/lib/Check";
  import Copy from "phosphor-svelte/lib/Copy";
  import Export from "phosphor-svelte/lib/Export";

  import { bookmarkletHref } from "../lib/bookmarklet";
  import { credentials } from "../lib/credentials.svelte";
  import { detectDevice, methodsFor, type SendMethod } from "../lib/device";
  import Connect from "./Connect.svelte";

  const POST_PATH = /^\/r\/([\w-]+)\/comments\/(\w+)(?:\/[^/]*)?(?:\/(\w+))?/;
  const SHARE_PATH = /^\/r\/([\w-]+)\/s\/([\w-]+)/;

  const INSTALL_COMMAND =
    "git clone https://github.com/caincodes/threadshot && threadshot/extension/install.sh";
  const INSTALL_GUIDE =
    "https://github.com/caincodes/threadshot/blob/main/extension/README.md";

  const METHODS: Record<SendMethod, { title: string; description: string }> = {
    shortcut: {
      title: "iOS Shortcut",
      description: "Send posts from Safari's Share button on iPhone or iPad.",
    },
    extension: {
      title: "Safari extension",
      description: "A toolbar button for Safari on a Mac.",
    },
    bookmark: {
      title: "Bookmark",
      description: "Works in Chrome, Edge and Firefox, including on Windows.",
    },
  };

  type Mode = SendMethod | "key";

  const device = detectDevice();
  const methods = methodsFor(device);

  // Links to "/#no-key" (from the key form, the guide, error screens) open the
  // method that fits this device. A saved key means this visitor uses it.
  const modeFromHash = (): Mode | null => {
    const hash = window.location.hash.slice(1);
    if (hash === "no-key") return methods[0];
    return hash === "key" || Object.hasOwn(METHODS, hash) ? (hash as Mode) : null;
  };

  let mode = $state<Mode>(
    modeFromHash() ?? (credentials.value ? "key" : methods[0])
  );

  const choose = (next: Mode) => {
    mode = next;
    history.replaceState(null, "", window.location.pathname);
  };

  $effect(() => {
    const onHashChange = () => {
      mode = modeFromHash() ?? mode;
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  });

  let link = $state("");
  let error = $state("");
  let copied = $state<"command" | "bookmark" | null>(null);

  const isConnected = $derived(credentials.value !== null);
  const bookmark = bookmarkletHref(window.location.origin);

  const copy = async (what: "command" | "bookmark", text: string) => {
    await navigator.clipboard.writeText(text);
    copied = what;
    setTimeout(() => (copied = null), 2000);
  };

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

{#snippet option(id: Mode, title: string, description: string, hint?: string)}
  <button
    class="flex min-h-11 w-full cursor-pointer items-start justify-between gap-3 p-4 text-left transition-colors duration-150 hover:bg-canvas"
    aria-controls="{id}-panel"
    aria-expanded={mode === id}
    onclick={() => choose(id)}
    type="button"
  >
    <span class="flex flex-col gap-0.5">
      <span class="flex flex-wrap items-baseline gap-x-2">
        <span class="font-semibold">{title}</span>
        {#if hint}
          <span class="text-sm font-medium text-accent">{hint}</span>
        {/if}
      </span>
      <span class="text-sm text-ink-2">{description}</span>
    </span>
    <span
      class={[
        "mt-0.5 shrink-0 transition-transform duration-150",
        mode === id && "rotate-180",
      ]}
    >
      <CaretDown size={20} weight="bold" />
    </span>
  </button>
{/snippet}

{#snippet shortcutSteps()}
  <ol class="steps">
    <li>Add the Shortcut with the button below.</li>
    <li>
      In the Settings app, open Shortcuts, then Advanced, and turn on Allow
      Running Scripts.
    </li>
    <li>
      On a Reddit post or comment in Safari, tap Safari's Share button, not
      Reddit's, and choose threadshot.
    </li>
    <li>
      In the Reddit app, the same steps open the post in Safari. Share it again
      from there.
    </li>
  </ol>
  {#if device === "ios"}
    <a class="btn btn-primary self-start" href="/threadshot.shortcut">
      <Export size={20} weight="bold" />
      Add the Shortcut
    </a>
  {:else}
    <p class="text-sm text-ink-2">
      Open threadshot.app on your iPhone or iPad to add it.
    </p>
  {/if}
{/snippet}

{#snippet extensionSteps()}
  <ol class="steps">
    <li>
      Give your terminal app Full Disk Access in System Settings, under Privacy
      &amp; Security, then quit Safari.
    </li>
    <li>Run the command below in that terminal app.</li>
    <li>Open Safari and turn on Threadshot in Settings, under Extensions.</li>
    <li>On a Reddit post, click the Threadshot button in the toolbar.</li>
  </ol>
  <code
    class="block rounded-ui bg-canvas p-3 font-mono text-sm [overflow-wrap:anywhere]"
    >{INSTALL_COMMAND}</code
  >
  <div class="flex flex-wrap items-center gap-x-5 gap-y-3">
    <button
      class="btn btn-primary"
      onclick={() => copy("command", INSTALL_COMMAND)}
      type="button"
    >
      {#if copied === "command"}
        <Check size={20} weight="bold" />
        Copied
      {:else}
        <Copy size={20} weight="bold" />
        Copy command
      {/if}
    </button>
    <a class="link inline-flex items-center gap-1" href={INSTALL_GUIDE} rel="noopener">
      Full install guide
      <ArrowSquareOut size={16} weight="bold" />
    </a>
  </div>
  <p class="text-sm text-ink-2">
    Needs Safari 27 or later. Apple doesn't support installing extensions this
    way, so a Safari update can stop it working.
  </p>
{/snippet}

{#snippet bookmarkSteps()}
  {#if device === "android"}
    <ol class="steps">
      <li>Bookmark any page, then copy the code with the button below.</li>
      <li>
        Edit that bookmark. Name it threadshot and replace its URL with the
        code.
      </li>
      <li>
        On a Reddit post, type threadshot in the address bar and tap the
        bookmark.
      </li>
    </ol>
    <button
      class="btn btn-primary self-start"
      onclick={() => copy("bookmark", bookmark)}
      type="button"
    >
      {#if copied === "bookmark"}
        <Check size={20} weight="bold" />
        Copied
      {:else}
        <Copy size={20} weight="bold" />
        Copy bookmark code
      {/if}
    </button>
  {:else}
    <ol class="steps">
      <li>Drag the button below up to your bookmarks bar.</li>
      <li>Open any Reddit post.</li>
      <li>Click the bookmark.</li>
    </ol>
    <a
      class="btn btn-primary cursor-grab self-start active:cursor-grabbing"
      draggable="true"
      href={bookmark}
    >
      <BookmarkSimple size={20} weight="bold" />
      Send to threadshot.app
    </a>
    {#if device === "ios"}
      <p class="text-sm text-ink-2">
        Safari on iPhone and iPad won't run bookmarks, so use the Shortcut there.
      </p>
    {:else}
      <p class="text-sm text-ink-2">
        Can't see your bookmarks bar? Press Ctrl+Shift+B (Cmd+Shift+B on a Mac)
        to show it.
      </p>
    {/if}
  {/if}
{/snippet}

<div class="mt-8 flex flex-col gap-4">
  <div class="divide-y divide-line border border-line">
    {#each methods as id, index (id)}
      <section>
        <h2>
          {@render option(
            id,
            METHODS[id].title,
            METHODS[id].description,
            index === 0 ? "Best for this device" : undefined
          )}
        </h2>
        {#if mode === id}
          <div id="{id}-panel" class="flex flex-col gap-4 px-4 pb-4">
            {#if id === "shortcut"}
              {@render shortcutSteps()}
            {:else if id === "extension"}
              {@render extensionSteps()}
            {:else}
              {@render bookmarkSteps()}
            {/if}
          </div>
        {/if}
      </section>
    {/each}
  </div>

  {#if mode !== "key"}
    <p class="text-sm text-ink-2">
      For a faster experience,
      <a class="link" href="/get-a-key">request a key from Reddit</a>.
    </p>
  {/if}

  <section class="border border-line">
    <h2>
      {@render option(
        "key",
        "I have a Reddit key",
        "Paste your app's client ID, then load any post by its link."
      )}
    </h2>
    {#if mode === "key"}
      <div id="key-panel" class="flex flex-col gap-4 px-4 pb-4">
        <Connect isEmbedded />

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
              <p
                id="url-error"
                class="text-sm font-medium text-accent"
                role="alert"
              >
                {error}
              </p>
            {/if}
            <button class="btn btn-primary self-start" type="submit">
              Generate screenshot
            </button>
          </form>
        {/if}
      </div>
    {/if}
  </section>

  <p class="text-sm text-ink-2">
    Just looking? <a class="link" href="/generate?sample=1">Try a sample post</a>
  </p>
</div>
