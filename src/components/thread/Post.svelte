<script lang="ts">
  import ArrowUp from "phosphor-svelte/lib/ArrowUp";
  import ChatCircle from "phosphor-svelte/lib/ChatCircle";
  import Clock from "phosphor-svelte/lib/Clock";
  import Medal from "phosphor-svelte/lib/Medal";

  import { REDACTED } from "../../functions/util/censorText";
  import { formatAgo, formatCount } from "../../functions/util/format";
  import { editor } from "../../lib/editor.svelte";
  import type { RedditSubmission } from "../../types/reddit";
  import FlairBadge from "./FlairBadge.svelte";
  import PostMedia from "./media/PostMedia.svelte";
  import Username from "./Username.svelte";

  let { submission }: { submission: RedditSubmission } = $props();

  // "r/" (or "u/" for a post on a profile) is always shown; only the name is
  // replaced when redacting.
  const community = $derived.by(() => {
    const prefixed =
      submission.subreddit_name_prefixed ?? `r/${submission.subreddit}`;
    return editor.isCensorSubreddits
      ? `${prefixed.slice(0, 2)}${REDACTED}`
      : prefixed;
  });
</script>

<article class="border-b border-ap-line px-4 pt-5 pb-4">
  <h1 class="text-[22px] leading-[1.2] font-bold">{submission.title}</h1>

  <div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
    <span class="font-semibold text-ap-link">{community}</span>
    <span class="text-ap-muted"><Username name={submission.author} /></span>
    {#if submission.userFlair && !editor.hideTags}
      <FlairBadge flair={submission.userFlair} />
    {/if}
  </div>
  {#if submission.flair && !editor.hideTags}
    <div class="mt-2"><FlairBadge flair={submission.flair} /></div>
  {/if}

  <div class="mt-3"><PostMedia {submission} /></div>

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
    <span class="inline-flex items-center gap-1">
      <Clock size={15} weight="bold" />
      {formatAgo(submission.created_utc)}
    </span>
    {#if submission.awardCount}
      <span class="inline-flex items-center gap-1">
        <Medal size={15} weight="bold" />
        {submission.awardCount}
      </span>
    {/if}
  </footer>
</article>
