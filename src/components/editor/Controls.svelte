<script lang="ts">
  import DownloadSimple from "phosphor-svelte/lib/DownloadSimple";
  import Export from "phosphor-svelte/lib/Export";

  import { formatDate, type DateFormat } from "../../functions/util/format";
  import { snippetFromSelection } from "../../lib/bodySnippet";
  import { editor, isTouchDevice } from "../../lib/editor.svelte";
  import { SORT_TYPES } from "../../types/reddit";
  import NumberField from "../ui/NumberField.svelte";
  import Segmented from "../ui/Segmented.svelte";
  import Select from "../ui/Select.svelte";
  import Spinner from "../ui/Spinner.svelte";
  import Switch from "../ui/Switch.svelte";
  import ExportPreview from "./ExportPreview.svelte";

  let {
    canDownload,
    hasBody,
    isAlbum,
    botCount,
  }: {
    canDownload: boolean;
    hasBody: boolean;
    isAlbum: boolean;
    botCount: number;
  } = $props();

  const isTouch = isTouchDevice();

  let saveResult = $state<"saved" | "failed" | null>(null);

  // Advanced settings keep working while Basic hides them, so the tab counts any
  // that have been changed.
  let optionsMode = $state<"basic" | "advanced">("basic");
  const isAdvanced = $derived(optionsMode === "advanced");

  const optionsModes = [
    { value: "basic", text: "Basic" },
    { value: "advanced", text: "Advanced" },
  ] as const;

  const themes = [
    { value: "light", text: "Light" },
    { value: "dark", text: "Dark" },
  ] as const;

  const sortOptions = SORT_TYPES.map((value) => ({
    value,
    text: value.charAt(0).toUpperCase() + value.slice(1),
  }));

  // Each format is shown as it would look, using today's date.
  const today = new Date();
  const dateFormats = (["short", "long", "us", "world", "iso"] as const).map(
    (value): { value: DateFormat; text: string } => ({
      value,
      text: formatDate(today, value),
    })
  );
  dateFormats.push({ value: "ago", text: "Time ago (9h)" });

  const timeDisplays = [
    { value: "today", text: "Today" },
    { value: "always", text: "Always" },
    { value: "off", text: "Off" },
  ] as const;

  const timeFormats = [
    { value: "12h", text: "12-hour" },
    { value: "24h", text: "24-hour" },
  ] as const;

  const redactStyles = [
    { value: "box", text: "Box" },
    { value: "scribble", text: "Scribble" },
    { value: "hide", text: "Hide" },
  ] as const;

  const bodyModes = [
    { value: "full", text: "Full" },
    { value: "snippet", text: "Snippet" },
    { value: "off", text: "Off" },
  ] as const;

  // A tap on the button can clear the highlight on touch screens, so the last
  // one is kept until it is used.
  $effect(() => {
    if (editor.postBody !== "snippet" || editor.bodySnippet) {
      return;
    }
    const onSelectionChange = () => {
      const snippet = snippetFromSelection(getSelection());
      if (snippet) {
        editor.bodySelection = snippet;
      }
    };
    document.addEventListener("selectionchange", onSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", onSelectionChange);
  });

  const useSelection = () => {
    editor.bodySnippet = editor.bodySelection;
    editor.bodySelection = null;
    getSelection()?.removeAllRanges();
  };
</script>

{#snippet heading(text: string)}
  <h2 class="option-row text-sm font-semibold">{text}</h2>
{/snippet}

<!-- On small screens this sits between the preview and the options. -->
<button
  class="btn btn-primary w-full"
  disabled={!canDownload || editor.isDownloading}
  onclick={editor.download}
  type="button"
>
  {#if editor.isDownloading}
    <Spinner />
    Rendering
  {:else if isTouch}
    <Export size={20} weight="bold" />
    Share image
  {:else}
    <DownloadSimple size={20} weight="bold" />
    Download PNG
  {/if}
</button>

<div class="mt-4 flex flex-col border border-line bg-white px-4">
  <div
    class="grid grid-cols-2 border-b border-line"
    aria-label="Options"
    role="group"
  >
    {#each optionsModes as mode (mode.value)}
      <button
        class="options-tab"
        aria-pressed={optionsMode === mode.value}
        onclick={() => (optionsMode = mode.value)}
        type="button"
      >
        {mode.text}{#if mode.value === "advanced" && !isAdvanced && editor.changedAdvancedCount}{` (${editor.changedAdvancedCount})`}{/if}
      </button>
    {/each}
  </div>

  <div class="divide-y divide-line pt-2">
    <!-- Only shown for posts these apply to. -->
    {#if hasBody || isAlbum}
      <div class="py-2">
        {@render heading("Post")}
        {#if hasBody}
          <Segmented
            label="Post body"
            options={bodyModes}
            bind:value={editor.postBody}
          />
          {#if editor.postBody === "snippet"}
            <div class="flex flex-col gap-3 pt-2 pb-2">
              {#if editor.bodySnippet}
                <button
                  class="btn btn-secondary h-9 text-sm pointer-coarse:h-11"
                  onclick={() => (editor.bodySnippet = null)}
                  type="button"
                >
                  Choose a different snippet
                </button>
              {:else}
                <p class="text-sm text-ink-2">
                  Highlight text in the post, then use it as the snippet.
                </p>
                <button
                  class="btn btn-secondary h-9 text-sm pointer-coarse:h-11"
                  disabled={!editor.bodySelection}
                  onclick={useSelection}
                  type="button"
                >
                  Use highlighted text
                </button>
              {/if}
            </div>
          {/if}
        {/if}
        {#if isAlbum}
          <NumberField
            label="Album columns"
            max={50}
            min={1}
            bind:value={editor.imageColumns}
          />
        {/if}
      </div>
    {/if}

    <div class="py-2">
      {@render heading("Comments")}
      <Switch label="Show comments" bind:checked={editor.showComments} />
      {#if editor.showComments}
        {#if isAdvanced}
          <Select
            class="w-30 pointer-coarse:w-36"
            label="Sort"
            options={sortOptions}
            bind:value={editor.commentSort}
          />
        {/if}
        <NumberField
          label="Top-level comments"
          max={50}
          min={0}
          bind:value={editor.topLevelComments}
        />
        {#if isAdvanced}
          <NumberField
            label="Replies per comment"
            max={50}
            min={0}
            bind:value={editor.commentReplies}
          />
          <NumberField
            label="Reply depth"
            max={50}
            min={0}
            bind:value={editor.replyDepth}
          />
          <Switch
            label={botCount ? `Hide bot comments (${botCount} found)` : "Hide bot comments (none found)"}
            bind:checked={editor.hideBots}
          />
        {/if}
      {/if}
    </div>

    <div class="py-2">
      {@render heading("Date and time")}
      <Switch label="Show date" bind:checked={editor.showDate} />
      {#if isAdvanced}
        {#if editor.showDate}
          <Select
            class="w-36 pointer-coarse:w-44"
            label="Date format"
            options={dateFormats}
            bind:value={editor.dateFormat}
          />
        {/if}
        <!-- "Time ago" already says how recent it is. -->
        {#if !editor.showDate || editor.dateFormat !== "ago"}
          <Segmented
            label="Show time"
            options={timeDisplays}
            bind:value={editor.timeDisplay}
          />
          {#if editor.timeDisplay !== "off"}
            <Segmented
              label="Time format"
              options={timeFormats}
              bind:value={editor.timeFormat}
            />
          {/if}
        {/if}
      {/if}
    </div>

    <div class="py-2">
      {@render heading("Privacy")}
      <Switch label="Redact usernames" bind:checked={editor.isCensorUsernames} />
      <Switch label="Redact subreddit" bind:checked={editor.isCensorSubreddits} />
      {#if isAdvanced && (editor.isCensorUsernames || editor.isCensorSubreddits)}
        <Segmented
          label="Redact with"
          options={redactStyles}
          bind:value={editor.redactStyle}
        />
      {/if}
    </div>

    <div class="py-2">
      {@render heading("Appearance")}
      <Segmented label="Theme" options={themes} bind:value={editor.theme} />
      <Switch label="Hide watermark" bind:checked={editor.hideWatermark} />
      <Switch label="Subreddit icon" bind:checked={editor.showSubredditIcon} />
      <Switch label="Profile pictures" bind:checked={editor.showProfileIcons} />
      {#if isAdvanced}
        <Switch label="Hide post tags" bind:checked={editor.hidePostTags} />
        <Switch label="Hide user flair" bind:checked={editor.hideUserFlair} />
      {/if}
    </div>
  </div>

  <div class="flex flex-col items-start gap-1 border-t border-line py-3">
    <button
      class="link text-sm"
      onclick={() => (saveResult = editor.saveDefaults() ? "saved" : "failed")}
      type="button"
    >
      Save as default
    </button>
    {#if saveResult}
      <p class="text-sm text-ink-2" role="status">
        {saveResult === "saved"
          ? "Saved to this browser's local storage."
          : "Could not save. This browser is blocking local storage."}
      </p>
    {/if}
  </div>
</div>

<ExportPreview />
