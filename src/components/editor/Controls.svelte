<script lang="ts">
  import DownloadSimple from "phosphor-svelte/lib/DownloadSimple";

  import { editor } from "../../lib/editor.svelte";
  import { SORT_TYPES } from "../../types/reddit";
  import NumberField from "../ui/NumberField.svelte";
  import Segmented from "../ui/Segmented.svelte";
  import Spinner from "../ui/Spinner.svelte";
  import Switch from "../ui/Switch.svelte";

  let { canDownload }: { canDownload: boolean } = $props();

  const themes = [
    { value: "light", text: "Light" },
    { value: "dark", text: "Dark" },
  ] as const;
</script>

{#snippet heading(text: string)}
  <h2 class="pt-3 text-sm font-semibold">{text}</h2>
{/snippet}

<div class="flex flex-col border border-line bg-white p-4">
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

  <div class="mt-4 border-t border-line">
    {@render heading("Appearance")}
    <Segmented label="Theme" options={themes} bind:value={editor.theme} />
    <Switch label="Show watermark" bind:checked={editor.showAttribution} />
  </div>

  <div class="mt-3 border-t border-line">
    {@render heading("Privacy")}
    <Switch label="Hide usernames" bind:checked={editor.isCensorUsernames} />
    <Switch label="Hide subreddit" bind:checked={editor.isCensorSubreddits} />
  </div>

  <div class="mt-3 border-t border-line">
    {@render heading("Post")}
    <NumberField
      label="Album columns"
      max={50}
      min={1}
      bind:value={editor.imageColumns}
    />
  </div>

  <div class="mt-3 border-t border-line">
    {@render heading("Comments")}
    <Switch label="Show comments" bind:checked={editor.showComments} />
    {#if editor.showComments}
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
