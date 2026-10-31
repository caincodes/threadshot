<script lang="ts">
  import ArrowUp from "phosphor-svelte/lib/ArrowUp";
  import Medal from "phosphor-svelte/lib/Medal";

  import { applyCensoring } from "../../functions/util/censorText";
  import { formatAgo, formatCount } from "../../functions/util/format";
  import { editor } from "../../lib/editor.svelte";
  import type { MoreChildren, RedditComment } from "../../types/reddit";
  import Comment from "./Comment.svelte";
  import FlairBadge from "./FlairBadge.svelte";
  import Username from "./Username.svelte";

  // `level` is the depth within the image (0 for the first comment shown),
  // not reddit's absolute depth, so permalinks to deep comments still render.
  let {
    data,
    level = 0,
  }: { data: RedditComment | MoreChildren; level?: number } = $props();

  // Anything that isn't a comment is a "more children" stub, out of scope.
  const comment = $derived(
    data.type === "comment" && level <= editor.replyDepth ? data : null
  );
  const replies = $derived(
    comment
      ? comment.replyTree
          .slice(0, editor.commentReplies)
          .filter((reply) => reply.type === "comment")
      : []
  );
  const body = $derived(
    comment
      ? applyCensoring(comment.body_html, {
          subreddits: editor.isCensorSubreddits,
          usernames: editor.isCensorUsernames,
        })
      : ""
  );
</script>

{#if comment}
  <div
    class={level === 0
      ? "border-b border-ap-line px-4 py-3"
      : "mt-3 border-l-[3px] pl-3"}
    style:border-left-color={level > 0
      ? `var(--ap-t${((level - 1) % 6) + 1})`
      : undefined}
  >
    <div class="flex items-baseline justify-between gap-3 text-[13px] leading-5">
      <span class="flex min-w-0 flex-wrap items-center gap-x-2">
        <span
          class={[
            "font-semibold",
            comment.is_submitter ? "text-ap-link" : "text-ap-muted",
          ]}
        >
          <Username name={comment.author} />
        </span>
        {#if comment.flair}<FlairBadge flair={comment.flair} />{/if}
        <span class="inline-flex items-center gap-0.5 font-medium text-ap-muted">
          <ArrowUp size={13} weight="bold" />
          {formatCount(comment.score)}
        </span>
        {#if comment.awardCount}
          <span class="inline-flex items-center gap-0.5 text-ap-muted">
            <Medal size={13} weight="bold" />
            {comment.awardCount}
          </span>
        {/if}
      </span>
      <span class="shrink-0 text-ap-muted">{formatAgo(comment.created_utc)}</span>
    </div>

    <div class="md mt-1 text-base leading-[22px]">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -- reddit's own sanitized HTML -->
      {@html body}
    </div>

    {#each replies as reply (reply.id)}
      <Comment data={reply} level={level + 1} />
    {/each}
  </div>
{/if}
