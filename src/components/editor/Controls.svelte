<script lang="ts">
  import DownloadSimple from "phosphor-svelte/lib/DownloadSimple";

  import { editor } from "../../lib/editor.svelte";
  import { SORT_TYPES } from "../../types/reddit";
  import NumberField from "../ui/NumberField.svelte";
  import Segmented from "../ui/Segmented.svelte";
  import Spinner from "../ui/Spinner.svelte";
  import Switch from "../ui/Switch.svelte";

  let {
    canDownload,
    isAlbum,
    botCount,
  }: { canDownload: boolean; isAlbum: boolean; botCount: number } = $props();

  const themes = [
    { value: "light", text: "Light" },
    { value: "dark", text: "Dark" },
  ] as const;
</script>

{#snippet heading(text: string)}
  <h2 class="pt-3 text-sm font-semibold">{text}</h2>
{/snippet}

<div class="flex flex-col border border-line bg-white p-4">
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
      {:else}
        <DownloadSimple size={20} weight="bold" />
        Download PNG
      {/if}
    </button>
  </div>

  <div class="border-t border-line lg:mt-4">
    {@render heading("Appearance")}
    <Segmented label="Theme" options={themes} bind:value={editor.theme} />
    <Switch label="Show watermark" bind:checked={editor.showAttribution} />
    <Switch label="Hide tags" bind:checked={editor.hideTags} />
  </div>

  <div class="mt-3 border-t border-line">
    {@render heading("Privacy")}
    <Switch label="Redact usernames" bind:checked={editor.isCensorUsernames} />
    <Switch label="Redact subreddit" bind:checked={editor.isCensorSubreddits} />
  </div>

  <!-- Only meaningful for album posts, so only shown for them. -->
  {#if isAlbum}
    <div class="mt-3 border-t border-line">
      {@render heading("Post")}
      <NumberField
        label="Album columns"
        max={50}
        min={1}
        bind:value={editor.imageColumns}
      />
    </div>
  {/if}

  <div class="mt-3 border-t border-line">
    {@render heading("Comments")}
    <Switch label="Show comments" bind:checked={editor.showComments} />
    {#if editor.showComments}
      <Switch
        label={botCount ? `Hide bot comments (${botCount} found)` : "Hide bot comments (none found)"}
        bind:checked={editor.hideBots}
      />
      <NumberField
        label="Top-level comments"
        max={50}
        min={0}
        bind:value={editor.topLevelComments}
      />
      <NumberField
        label="Reply depth"
        max={50}
        min={0}
        bind:value={editor.replyDepth}
      />
      <NumberField
        label="Replies per comment"
        max={50}
        min={0}
        bind:value={editor.commentReplies}
      />
      <label class="flex min-h-12 items-center justify-between gap-3">
        <span class="text-sm">Sort</span>
        <select class="field w-36" bind:value={editor.commentSort}>
          {#each SORT_TYPES as sortType (sortType)}
            <option value={sortType}>
              {sortType.charAt(0).toUpperCase() + sortType.slice(1)}
            </option>
          {/each}
        </select>
      </label>
    {/if}
  </div>
</div>
