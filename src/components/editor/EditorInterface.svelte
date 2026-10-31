<script lang="ts">
  import { editor } from "../../lib/editor.svelte";
  import { SORT_TYPES } from "../../types/reddit";
  import Heading from "../ui/Heading.svelte";
  import NumberInput from "../ui/NumberInput.svelte";
  import Paragraph from "../ui/Paragraph.svelte";
  import PrimaryButton from "../ui/PrimaryButton.svelte";
  import Title from "../ui/Title.svelte";
  import Toggle from "../ui/Toggle.svelte";
</script>

{#snippet option(label: string, control: import("svelte").Snippet)}
  <div class="flex items-center justify-between gap-1">
    <Paragraph>{label}</Paragraph>
    {@render control()}
  </div>
{/snippet}

<div class="flex max-w-screen flex-col items-center">
  <Title class="h-8">Image Options</Title>
  <div
    class="flex flex-col gap-1.5 rounded-lg bg-white px-[18px] py-1 text-left shadow-sm"
  >
    <PrimaryButton isLoading={editor.isLoading} onclick={editor.download}>
      Download Image
    </PrimaryButton>

    <div class="flex flex-col gap-2">
      <Heading>Privacy</Heading>
      {#snippet censorUsernames()}
        <Toggle label="Censor Usernames" bind:checked={editor.isCensorUsernames} />
      {/snippet}
      {@render option("Censor Usernames", censorUsernames)}
      {#snippet censorSubreddits()}
        <Toggle
          label="Censor Subreddits"
          bind:checked={editor.isCensorSubreddits}
        />
      {/snippet}
      {@render option("Censor Subreddits", censorSubreddits)}
    </div>

    <div class="h-px bg-surface-400"></div>

    <div class="flex flex-col gap-2">
      <Heading>Submission</Heading>
      {#snippet columns()}
        <NumberInput
          label="Number of Image Album Columns"
          max={50}
          min={1}
          bind:value={editor.imageColumns}
        />
      {/snippet}
      {@render option("Number of Image Album Columns", columns)}
    </div>

    <div class="h-px bg-surface-400"></div>

    <div class="flex flex-col gap-2">
      <Heading>Comments</Heading>
      {#snippet showComments()}
        <Toggle label="Show Comments" bind:checked={editor.showComments} />
      {/snippet}
      {@render option("Show Comments", showComments)}
      {#if editor.showComments}
        {#snippet topLevel()}
          <NumberInput
            label="Number of Top Level Comments"
            max={50}
            min={0}
            bind:value={editor.topLevelComments}
          />
        {/snippet}
        {@render option("Number of Top Level Comments", topLevel)}
        {#snippet depth()}
          <NumberInput
            label="Comment Reply Depth"
            max={50}
            min={0}
            bind:value={editor.replyDepth}
          />
        {/snippet}
        {@render option("Comment Reply Depth", depth)}
        {#snippet replies()}
          <NumberInput
            label="Number of Replies to Each Comment"
            max={50}
            min={0}
            bind:value={editor.commentReplies}
          />
        {/snippet}
        {@render option("Number of Replies to Each Comment", replies)}
        {#snippet sort()}
          <select
            class="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm outline-none hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            aria-label="Sort"
            bind:value={editor.commentSort}
          >
            {#each SORT_TYPES as sortType (sortType)}
              <option>{sortType}</option>
            {/each}
          </select>
        {/snippet}
        {@render option("Sort", sort)}
      {/if}
    </div>
  </div>
</div>
