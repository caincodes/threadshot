<script lang="ts">
  import ArrowUp from "phosphor-svelte/lib/ArrowUp";
  import ChatCircle from "phosphor-svelte/lib/ChatCircle";
  import Clock from "phosphor-svelte/lib/Clock";
  import Medal from "phosphor-svelte/lib/Medal";

  import { formatCount } from "../../functions/util/format";
  import { editor } from "../../lib/editor.svelte";
  import type { RedditSubmission } from "../../types/reddit";
  import FlairBadge from "./FlairBadge.svelte";
  import PostMedia from "./media/PostMedia.svelte";
  import Redacted from "./Redacted.svelte";
  import Username from "./Username.svelte";
  import Watermark from "./Watermark.svelte";

  let {
    submission,
    isPostLast = false,
  }: { submission: RedditSubmission; isPostLast?: boolean } = $props();

  const timestamp = $derived(editor.timestamp(submission.created_utc));
  const community = $derived(
    submission.subreddit_name_prefixed ?? `r/${submission.subreddit}`
  );
</script>

<article
  class={["border-ap-line px-4 pt-5 pb-4", isPostLast ? "" : "border-b"]}
>
  <h1 class="text-[22px] leading-[1.2] font-bold">{submission.title}</h1>

  <div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
    <!-- "r/" (or "u/" for a post on a profile) stays when the name is covered, and
         both go when it is hidden. -->
    {#if !editor.isCensorSubreddits}
      <span class="font-semibold text-ap-link">{community}</span>
    {:else if editor.redactStyle !== "hide"}
      <span class="font-semibold text-ap-link"
        >{community.slice(0, 2)}<Redacted name={community.slice(2)} /></span
      >
    {/if}
    <span class="text-ap-muted"><Username name={submission.author} /></span>
    {#if submission.userFlair && !editor.hideUserFlair}
      <FlairBadge flair={submission.userFlair} />
    {/if}
  </div>
  {#if submission.flair && !editor.hidePostTags}
    <div class="mt-2"><FlairBadge flair={submission.flair} /></div>
  {/if}

  <div class="mt-3 not-has-[>*]:hidden"><PostMedia {submission} /></div>

  <footer
    class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] font-medium text-ap-muted"
  >
    <span class="inline-flex items-center gap-1">
      <span class="text-ap-up"><ArrowUp size={15} weight="bold" /></span>
      {formatCount(submission.score)}
    </span>
    <span class="inline-flex items-center gap-1">
      <ChatCircle size={15} weight="bold" />
      {formatCount(submission.num_comments ?? 0)}
    </span>
    {#if timestamp}
      <span class="inline-flex items-center gap-1 whitespace-nowrap">
        <Clock size={15} weight="bold" />
        {timestamp}
      </span>
    {/if}
    {#if submission.awardCount}
      <span class="inline-flex items-center gap-1">
        <Medal size={15} weight="bold" />
        {submission.awardCount}
      </span>
    {/if}
    {#if isPostLast && !editor.hideWatermark}
      <Watermark class="ml-auto font-normal" />
    {/if}
  </footer>
</article>
