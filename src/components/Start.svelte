<script lang="ts">
  import BookmarkSimple from "phosphor-svelte/lib/BookmarkSimple";
  import CaretDown from "phosphor-svelte/lib/CaretDown";
  import Check from "phosphor-svelte/lib/Check";
  import Copy from "phosphor-svelte/lib/Copy";
  import Export from "phosphor-svelte/lib/Export";

  import type { Snippet } from "svelte";

  import { bookmarkletHref } from "../lib/bookmarklet";
  import { credentials } from "../lib/credentials.svelte";
  import { detectDevice, methodsFor, type SendMethod } from "../lib/device";
  import Connect from "./Connect.svelte";
  import Segmented from "./ui/Segmented.svelte";

  const POST_PATH = /^\/r\/([\w-]+)\/comments\/(\w+)(?:\/[^/]*)?(?:\/(\w+))?/;
  const SHARE_PATH = /^\/r\/([\w-]+)\/s\/([\w-]+)/;

  const INSTALL_COMMANDS = {
    curl: "curl -fsSL https://threadshot.app/extension.sh | sh",
    git: "git clone https://github.com/caincodes/threadshot && threadshot/extension/install.sh",
  };
  const INSTALL_TOOLS = [
    { value: "curl", text: "curl" },
    { value: "git", text: "git clone" },
  ] as const;
  const INSTALL_GUIDE =
    "https://github.com/caincodes/threadshot/blob/main/extension/README.md";

  const METHODS: Record<SendMethod, { tab: string; title: string }> = {
    shortcut: { tab: "Shortcut", title: "iOS Shortcut" },
    extension: { tab: "Extension", title: "Safari extension" },
    bookmark: { tab: "Bookmark", title: "Browser bookmark" },
  };

  const device = detectDevice();
  const methods = methodsFor(device);

  // Links to "/#no-key" (from the key form, the guide, error screens) open the
  // method that fits this device. A saved key means this visitor uses it.
  let method = $state(methods[0]);
  let isUsingKey = $state(credentials.value !== null);

  // Panels are stacked, so the block takes its height from the open one.
  let heights = $state<Partial<Record<SendMethod, number>>>({});

  const readHash = () => {
    const hash = window.location.hash.slice(1);
    if (hash === "key") {
      isUsingKey = true;
    } else if (hash === "no-key" || Object.hasOwn(METHODS, hash)) {
      method = hash === "no-key" ? methods[0] : (hash as SendMethod);
      isUsingKey = false;
    }
  };
  readHash();

  const clearHash = () =>
    history.replaceState(null, "", window.location.pathname);

  const chooseMethod = (next: SendMethod) => {
    method = next;
    isUsingKey = false;
    clearHash();
  };

  const toggleKey = () => {
    isUsingKey = !isUsingKey;
    clearHash();
  };

  $effect(() => {
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  });

  let link = $state("");
  let error = $state("");
  let copied = $state<"command" | "bookmark" | null>(null);
  let installTool = $state<keyof typeof INSTALL_COMMANDS>("curl");
  const installCommand = $derived(INSTALL_COMMANDS[installTool]);

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

<!-- Panels stay mounted so changing them can animate. Inert keeps a closed one
     out of the tab order. -->
{#snippet panel(id: string, isOpen: boolean, content: Snippet)}
  <div
    id="{id}-panel"
    class="accordion-panel"
    data-open={isOpen || undefined}
    inert={!isOpen}
  >
    <div class="accordion-clip">
      {@render content()}
    </div>
  </div>
{/snippet}

{#snippet step(number: number, content: Snippet)}
  <li class="flex items-baseline gap-3">
    <span class="heading text-2xl leading-none tabular-nums">{number}</span>
    <span>{@render content()}</span>
  </li>
{/snippet}

{#snippet shortcutSteps()}
  {#if device === "ios"}
    <a class="btn btn-primary self-start" href="/threadshot.shortcut">
      <Export size={20} weight="bold" />
      Add the Shortcut
    </a>
  {:else}
    <p class="font-semibold">Open this page on your iPhone or iPad to add it.</p>
  {/if}
  <ol class="flex flex-col gap-3">
    {#snippet allowScripts()}
      In Settings, go to Shortcuts, then Advanced, and turn on Allow Running
      Scripts.
    {/snippet}
    {#snippet share()}
      In Safari, tap Safari's Share button on a post and choose threadshot.
    {/snippet}
    {@render step(1, allowScripts)}
    {@render step(2, share)}
  </ol>
{/snippet}

{#snippet extensionSteps()}
  <Segmented
    label="Install with"
    options={INSTALL_TOOLS}
    bind:value={installTool}
  />
  <div class="flex items-start gap-1 rounded-ui bg-canvas pl-3">
    <code class="min-w-0 flex-1 py-3 font-mono text-sm [overflow-wrap:anywhere]">
      {installCommand}
    </code>
    <button
      class="btn-icon"
      aria-label={copied === "command" ? "Copied" : "Copy command"}
      onclick={() => copy("command", installCommand)}
      type="button"
    >
      {#if copied === "command"}
        <Check size={18} weight="bold" />
      {:else}
        <Copy size={18} weight="bold" />
      {/if}
    </button>
  </div>
  <ol class="flex flex-col gap-3">
    {#snippet install()}
      Quit Safari and run this in Terminal.
    {/snippet}
    {#snippet enable()}
      Turn on Threadshot in Safari's Extensions settings.
    {/snippet}
    {@render step(1, install)}
    {@render step(2, enable)}
  </ol>
  <p class="text-sm text-ink-2">
    Needs Safari 27 and Full Disk Access for Terminal.
    <a class="link" href={INSTALL_GUIDE} rel="noopener">Install guide</a>
  </p>
{/snippet}

{#snippet keyForm()}
  <Connect isEmbedded />

  <!-- The link field appears once a key is saved, so the key form is the only
       step until then. -->
  {#if isConnected}
    <form class="flex flex-col gap-3" onsubmit={go} novalidate>
      <label class="font-semibold" for="url-input">
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
        <p id="url-error" class="font-medium text-accent" role="alert">
          {error}
        </p>
      {/if}
      <button class="btn btn-primary self-start" type="submit">
        Generate screenshot
      </button>
    </form>
  {/if}
{/snippet}

{#snippet bookmarkSteps()}
  {#if device === "android"}
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
    <ol class="flex flex-col gap-3">
      {#snippet paste()}
        Save any page as a bookmark named threadshot, with this code as its URL.
      {/snippet}
      {#snippet open()}
        On a Reddit post, type threadshot in the address bar and tap it.
      {/snippet}
      {@render step(1, paste)}
      {@render step(2, open)}
    </ol>
  {:else}
    <a
      class="btn btn-primary cursor-grab self-start active:cursor-grabbing"
      draggable="true"
      href={bookmark}
    >
      <BookmarkSimple size={20} weight="bold" />
      Send to threadshot.app
    </a>
    <ol class="flex flex-col gap-3">
      {#snippet drag()}
        Drag this button to your bookmarks bar.
      {/snippet}
      {#snippet click()}
        Click it on any Reddit post.
      {/snippet}
      {@render step(1, drag)}
      {@render step(2, click)}
    </ol>
    {#if device === "ios"}
      <p class="text-sm text-ink-2">For computers. iOS Safari won't run bookmarks.</p>
    {/if}
  {/if}
{/snippet}

{#snippet methodPanel(id: SendMethod, index: number)}
  <div class="flex flex-col gap-4 p-5">
    <div class="flex flex-wrap items-baseline justify-between gap-x-3">
      <h2 class="heading text-2xl">{METHODS[id].title}</h2>
      {#if index === 0}
        <span class="text-sm text-ink-2">Best for this device</span>
      {/if}
    </div>
    {#if id === "shortcut"}
      {@render shortcutSteps()}
    {:else if id === "extension"}
      {@render extensionSteps()}
    {:else}
      {@render bookmarkSteps()}
    {/if}
  </div>
{/snippet}

<div class="mt-8 flex flex-col gap-3">
  <section class="border-2 border-ink">
    <div class="grid grid-cols-3 divide-x-2 divide-ink border-b-2 border-ink">
      {#each methods as id (id)}
        <button
          class="block-control h-12"
          aria-controls="{id}-panel"
          aria-expanded={!isUsingKey && method === id}
          onclick={() => chooseMethod(id)}
          type="button"
        >
          {METHODS[id].tab}
        </button>
      {/each}
    </div>
    <div
      class="tab-stack"
      style:height={isUsingKey ? "0px" : heights[method] && `${heights[method]}px`}
    >
      {#each methods as id, index (id)}
        {@const isOpen = !isUsingKey && method === id}
        <div
          id="{id}-panel"
          class="tab-panel"
          bind:offsetHeight={heights[id]}
          data-open={isOpen || undefined}
          inert={!isOpen}
        >
          {@render methodPanel(id, index)}
        </div>
      {/each}
    </div>
  </section>

  <section class="border border-line">
    <button
      class="block-control block-header flex min-h-12 w-full items-center justify-between gap-3 px-5 text-left"
      aria-controls="key-panel"
      aria-expanded={isUsingKey}
      onclick={toggleKey}
      type="button"
    >
      I have a Reddit key
      <span class={["accordion-caret", isUsingKey && "rotate-180"]}>
        <CaretDown size={18} weight="bold" />
      </span>
    </button>
    {#snippet keyContent()}
      <div class="flex flex-col gap-4 px-5 pb-5">
        {@render keyForm()}
      </div>
    {/snippet}
    {@render panel("key", isUsingKey, keyContent)}
  </section>

  {#snippet fasterLine()}
    <p class="text-sm text-ink-2">
      For a faster experience,
      <a class="link" href="/get-a-key">request a key from Reddit</a>.
    </p>
  {/snippet}
  {@render panel("faster", !isUsingKey, fasterLine)}
</div>
