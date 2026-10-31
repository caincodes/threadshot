<script lang="ts">
  import DownloadSimple from "phosphor-svelte/lib/DownloadSimple";
  import Export from "phosphor-svelte/lib/Export";

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

  const themes = [
    { value: "light", text: "Light" },
    { value: "dark", text: "Dark" },
  ] as const;

  const sortOptions = SORT_TYPES.map((value) => ({
    value,
    text: value.charAt(0).toUpperCase() + value.slice(1),
  }));

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

<div class="flex flex-col border border-line bg-white px-4 lg:pt-4">
  <!-- On small screens the preview comes first, so the download button is
       pinned to the bottom of the screen instead of sitting below it. The white
       continues past the bar, where Safari's floating toolbar leaves a gap. -->
  <div
    data-download-bar
    class="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] after:absolute after:inset-x-0 after:top-full after:h-screen after:bg-white lg:static lg:border-0 lg:p-0 lg:after:hidden"
  >
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
  </div>

  <div class="divide-y divide-line border-line lg:mt-4 lg:border-t">
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
        <Select
          class="w-30 pointer-coarse:w-36"
          label="Sort"
          options={sortOptions}
          bind:value={editor.commentSort}
        />
        <NumberField
          label="Top-level comments"
          max={50}
          min={0}
          bind:value={editor.topLevelComments}
        />
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
    </div>

    <div class="py-2">
      {@render heading("Privacy")}
      <Switch label="Redact usernames" bind:checked={editor.isCensorUsernames} />
      <Switch label="Redact subreddit" bind:checked={editor.isCensorSubreddits} />
    </div>

    <div class="py-2">
      {@render heading("Appearance")}
      <Segmented label="Theme" options={themes} bind:value={editor.theme} />
      <Switch label="Hide watermark" bind:checked={editor.hideWatermark} />
      <Switch label="Hide post tags" bind:checked={editor.hidePostTags} />
      <Switch label="Hide user flair" bind:checked={editor.hideUserFlair} />
    </div>
  </div>
</div>

<ExportPreview />
