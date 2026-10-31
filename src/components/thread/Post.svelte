<script lang="ts">
  import ChatCircle from "phosphor-svelte/lib/ChatCircle";
  import Medal from "phosphor-svelte/lib/Medal";
  import ShareFat from "phosphor-svelte/lib/ShareFat";

  import { formatAgo, formatCount } from "../../functions/util/format";
  import { editor } from "../../lib/editor.svelte";
  import type { RedditSubmission } from "../../types/reddit";
  import Avatar from "./Avatar.svelte";
  import FlairBadge from "./FlairBadge.svelte";
  import PostMedia from "./media/PostMedia.svelte";
  import Username from "./Username.svelte";
  import VoteBar from "./VoteBar.svelte";

  let { submission }: { submission: RedditSubmission } = $props();

  const subreddit = $derived(
    editor.isCensorSubreddits ? "a subreddit" : submission.subreddit_name_prefixed
  );
</script>

<article class="px-4 pt-4 pb-3">
  <header class="flex items-center gap-2">
    <Avatar
      censored={editor.isCensorSubreddits}
      kind="subreddit"
      seed={submission.subreddit}
    />
    <div class="min-w-0">
      <div class="flex flex-wrap items-center gap-x-1.5 text-xs leading-4">
        <span class="font-semibold text-rd-text">{subreddit}</span>
        <span class="text-rd-muted">&bull; {formatAgo(submission.created_utc)}</span>
        {#if submission.awardCount}
          <span class="inline-flex items-center gap-0.5 text-rd-muted">
            &bull; <Medal size={12} weight="fill" /> {submission.awardCount}
          </span>
        {/if}
      </div>
      <div class="flex items-center gap-1.5 text-xs leading-4 text-rd-muted">
        <Username name={submission.author} />
        {#if submission.userFlair}<FlairBadge flair={submission.userFlair} />{/if}
      </div>
    </div>
  </header>

  <h1 class="mt-3 text-lg leading-6 font-semibold text-rd-text">
    {submission.title}
  </h1>
  {#if submission.flair}
    <div class="mt-2"><FlairBadge flair={submission.flair} /></div>
  {/if}

  <div class="mt-3"><PostMedia {submission} /></div>

  <footer class="mt-3 flex items-center gap-2">
    <VoteBar pill score={submission.score} />
    <span class="rd-pill">
      <ChatCircle size={16} weight="bold" />
      {formatCount(submission.num_comments ?? 0)}
    </span>
    <span class="rd-pill">
      <ShareFat size={16} weight="bold" />
      Share
    </span>
  </footer>
</article>
