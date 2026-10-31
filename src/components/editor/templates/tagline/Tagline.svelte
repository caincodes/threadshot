<script lang="ts">
  import uniqolor from "uniqolor";

  import { editor } from "../../../../lib/editor.svelte";
  import type { RedditFlair } from "../../../../types/reddit";
  import Caption from "../../../ui/Caption.svelte";
  import Awards from "./Awards.svelte";
  import BadgeContainer from "./BadgeContainer.svelte";
  import Flair from "./Flair.svelte";

  interface Props {
    type: "submission" | "comment";
    username: string;
    score: string;
    date: string;
    subreddit?: string;
    flair?: RedditFlair;
    count: number;
    isSubmitter?: boolean;
    censorUser: boolean;
    censorSubreddit?: boolean;
  }

  let {
    username,
    score,
    date,
    subreddit,
    flair,
    count,
    isSubmitter,
    censorUser,
    censorSubreddit = false,
  }: Props = $props();
</script>

{#snippet dot()}
  <Caption>•</Caption>
{/snippet}

<div
  class="flex flex-row flex-wrap items-center gap-1"
  style:color={editor.theme.contrast[100]}
>
  {#if !censorUser}
    <Caption bold>{username}</Caption>
  {:else}
    <div
      class="h-4 w-12 rounded"
      style:background-color={uniqolor(username).color}
    ></div>
  {/if}
  {@render dot()}
  {#if isSubmitter}
    <BadgeContainer style="background-color: {editor.theme.special.highlight}">
      <Caption>OP</Caption>
    </BadgeContainer>
    {@render dot()}
  {/if}
  {#if flair}
    <Flair {flair} />
    {@render dot()}
  {/if}
  <Caption>{score}</Caption>
  {@render dot()}
  <Caption>{date}</Caption>
  {#if subreddit}
    {@render dot()}
    <Caption>{censorSubreddit ? "a subreddit" : subreddit}</Caption>
  {/if}
  {#if count !== 0}
    {@render dot()}
    <Awards {count} />
  {/if}
</div>
