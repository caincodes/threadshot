<script lang="ts">
  import BookmarkSimple from "phosphor-svelte/lib/BookmarkSimple";
  import CaretDown from "phosphor-svelte/lib/CaretDown";
  import ClipboardText from "phosphor-svelte/lib/ClipboardText";
  import Check from "phosphor-svelte/lib/Check";
  import Copy from "phosphor-svelte/lib/Copy";
  import Export from "phosphor-svelte/lib/Export";

  import type { Snippet } from "svelte";

  import { bookmarkletHref } from "../lib/bookmarklet";
  import { credentials } from "../lib/credentials.svelte";
  import { detectDevice, methodsFor, type SendMethod } from "../lib/device";
  import { editorTargetInText } from "../lib/links";
  import Connect from "./Connect.svelte";
  import Segmented from "./ui/Segmented.svelte";


  const INSTALL_COMMANDS = {
    curl: "curl -fsSL https://threadshot.app/extension.sh | sh",
    git: "git clone https://github.com/caincodes/threadshot && threadshot/extension/install.sh",
  };
  const INSTALL_TOOLS = [
    { value: "curl", text: "curl" },
    { value: "git", text: "git clone" },
  ] as const;
  const INSTALL_GUIDE = "/install-extension";

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

  // Which site the visitor is sending from. The home page preview follows it.
  type Platform = "reddit" | "x";
  const PLATFORMS: Array<{ value: Platform; name: string; detail: string }> = [
    { value: "x", name: "X", detail: "Posts and the replies they answer" },
    { value: "reddit", name: "Reddit", detail: "Posts and comment threads" },
  ];
  // X comes first, unless a saved Reddit key says this visitor uses Reddit.
  let platform = $state<Platform>(credentials.value ? "reddit" : "x");
  const site = $derived(platform === "x" ? "X" : "Reddit");
  // The key form closes the methods on the Reddit side only.
  const showMethods = $derived(platform === "x" || !isUsingKey);

  $effect(() => {
    document.body.dataset.platform = platform;
  });

  // Panels are stacked, so the block takes its height from the open one.
  let heights = $state<Partial<Record<SendMethod, number>>>({});

  const readHash = () => {
    const hash = window.location.hash.slice(1);
    if (hash === "x") {
      platform = "x";
      return;
    }
    if (hash === "key") {
      platform = "reddit";
      isUsingKey = true;
    } else if (hash === "no-key" || Object.hasOwn(METHODS, hash)) {
      platform = "reddit";
      method = hash === "no-key" ? methods[0] : (hash as SendMethod);
      isUsingKey = false;
    }
  };
  readHash();

  const clearHash = () =>
    history.replaceState(null, "", window.location.pathname);

  const choosePlatform = (next: Platform) => {
    platform = next;
    clearHash();
  };

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

  const NOT_A_LINK = "That does not look like a Reddit or X post link.";

  // Where a pasted link opens in the editor, or an error to show.
  const editorUrlFor = (value: string): { url: string } | { error: string } => {
    const target = editorTargetInText(value);
    return target ? { url: target.path } : { error: NOT_A_LINK };
  };

  const go = (event: SubmitEvent) => {
    event.preventDefault();
    error = "";
    const value = link.trim();
    if (!value) {
      error = "Paste a Reddit or X link first.";
      return;
    }
    const result = editorUrlFor(value);
    if ("error" in result) {
      error = result.error;
      return;
    }
    window.location.href = result.url;
  };

  // X posts need no key, so their link field is always there.
  let xLink = $state("");
  let xError = $state("");

  const xPathIn = (text: string) => {
    const target = editorTargetInText(text);
    return target?.platform === "x" ? target.path : null;
  };

  const goToX = (event: SubmitEvent) => {
    event.preventDefault();
    xError = "";
    const path = xPathIn(xLink);
    if (!path) {
      xError = xLink.trim()
        ? "That does not look like a link to a post on X."
        : "Paste a link to a post on X first.";
      return;
    }
    window.location.href = path;
  };

  // Pasting a link is enough; there is nothing else to fill in.
  const goOnPaste = (event: ClipboardEvent) => {
    const path = xPathIn(event.clipboardData?.getData("text") ?? "");
    if (path) {
      event.preventDefault();
      window.location.href = path;
    }
  };

  // One tap where the browser allows reading the clipboard.
  const canReadClipboard = Boolean(navigator.clipboard?.readText);
  const pasteFromClipboard = async () => {
    xError = "";
    let text: string;
    try {
      text = await navigator.clipboard.readText();
    } catch {
      xError = "Your browser did not allow reading the clipboard. Paste the link into the field instead.";
      return;
    }
    const path = xPathIn(text);
    if (path) {
      window.location.href = path;
    } else {
      xError = "The clipboard does not hold a link to a post on X. Copy one first.";
    }
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
    <div class="flex flex-col gap-1">
      <p class="font-semibold">Open this page on your iPhone or iPad to add it.</p>
      <p class="text-sm text-ink-2">
        Or
        <a class="link" href="/threadshot.shortcut" download>download the Shortcut</a>
        anyway.
      </p>
    </div>
  {/if}
  {#if platform === "x"}
    <ol class="flex flex-col gap-3">
      {#snippet shareFromX()}
        In the X app, tap Share on a post and choose threadshot.
      {/snippet}
      {#snippet runWithCopiedLink()}
        Or copy a post's link and run threadshot from your Home Screen, a
        widget, Siri or the Action button. No Share sheet needed.
      {/snippet}
      {@render step(1, shareFromX)}
      {@render step(2, runWithCopiedLink)}
    </ol>
  {:else}
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
  {/if}
{/snippet}

{#snippet extensionSteps()}
  <Segmented
    class="w-fit"
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
      Turn on Threadshot in Safari's Extensions settings, then click it on any
      {site} post.
    {/snippet}
    {@render step(1, install)}
    {@render step(2, enable)}
  </ol>
  <p class="text-sm text-ink-2">
    Needs Safari 27 and Full Disk Access for Terminal.
    <a class="link" href={INSTALL_GUIDE}>Install guide</a>
  </p>
{/snippet}

{#snippet keyForm()}
  <Connect isEmbedded />

  <!-- The link field appears once a key is saved, so the key form is the only
       step until then. -->
  {#if isConnected}
    <form class="flex flex-col gap-3" onsubmit={go} novalidate>
      <label class="font-semibold" for="url-input">
        Reddit or X post link
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
        On a {site} post, type threadshot in the address bar and tap it.
      {/snippet}
      {@render step(1, paste)}
      {@render step(2, open)}
    </ol>
    {#if platform === "x"}
      <p class="text-sm text-ink-2">
        Using the X app? Add threadshot.app to your Home screen from your
        browser's menu, then share posts to it from the X app.
      </p>
    {/if}
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
        Click it on any {site} post.
      {/snippet}
      {@render step(1, drag)}
      {@render step(2, click)}
    </ol>
    {#if device === "ios"}
      <p class="text-sm text-ink-2">For computers. Not compatible with mobile.</p>
    {/if}
  {/if}
{/snippet}

{#snippet methodPanel(id: SendMethod, index: number)}
  <div class="flex flex-col gap-4 p-5">
    <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <h2 class="heading text-2xl">{METHODS[id].title}</h2>
      {#if index === 0}
        <span
          class="rounded-ui bg-accent px-2.5 py-1 text-xs font-semibold tracking-wide text-white uppercase"
        >
          Best for this device
        </span>
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

{#snippet xLinkSection()}
  <section class="border-2 border-ink p-5">
    <form class="flex flex-col gap-3" onsubmit={goToX} novalidate>
      <label class="heading text-2xl" for="x-url-input">Paste a link from X</label>
      <p class="-mt-1 text-sm text-ink-2">
        Any public post works, with no key or account. Pasting a link opens it.
      </p>
      <div class="flex flex-col gap-3 sm:flex-row">
        <input
          id="x-url-input"
          onpaste={goOnPaste}
          class="field min-w-0 sm:flex-1"
          aria-describedby="x-url-error"
          autocapitalize="off"
          autocomplete="off"
          bind:value={xLink}
          inputmode="url"
          placeholder="https://x.com/username/status/..."
          spellcheck="false"
          type="text"
        />
        <button class="btn btn-primary" type="submit">Generate</button>
        {#if canReadClipboard}
          <button
            class="btn btn-secondary"
            onclick={pasteFromClipboard}
            type="button"
          >
            <ClipboardText size={20} weight="bold" />
            Paste
          </button>
        {/if}
      </div>
      {#if xError}
        <p id="x-url-error" class="font-medium text-accent" role="alert">
          {xError}
        </p>
      {/if}
    </form>
    <p class="mt-4 text-sm text-ink-2">
      Or <a class="link" href="/generate?sample=x">try a sample post from X</a>.
    </p>
  </section>
{/snippet}

{#snippet methodsSection()}
  <section class="border-2 border-ink">
    <div class="grid grid-cols-3 divide-x-2 divide-ink border-b-2 border-ink">
      {#each methods as id (id)}
        <button
          class="block-control h-12"
          aria-controls="{id}-panel"
          aria-expanded={showMethods && method === id}
          onclick={() => chooseMethod(id)}
          type="button"
        >
          {METHODS[id].tab}
        </button>
      {/each}
    </div>
    <div
      class="tab-stack"
      style:height={showMethods ? heights[method] && `${heights[method]}px` : "0px"}
    >
      {#each methods as id, index (id)}
        {@const isOpen = showMethods && method === id}
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
{/snippet}

<div class="mt-8 flex flex-col gap-3">
  <div class="grid grid-cols-2 gap-3" aria-label="Send from" role="group">
    {#each PLATFORMS as option (option.value)}
      <button
        class="platform-option"
        aria-pressed={platform === option.value}
        onclick={() => choosePlatform(option.value)}
        type="button"
      >
        <span class="heading text-2xl leading-none">{option.name}</span>
        <span class="text-sm">{option.detail}</span>
      </button>
    {/each}
  </div>

  {#if platform === "x"}
    {@render xLinkSection()}
    <p class="mt-2 font-semibold">Or send posts from X in one tap</p>
    {@render methodsSection()}
  {:else}
    {@render methodsSection()}

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
  {/if}
</div>
