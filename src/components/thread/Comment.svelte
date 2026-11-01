<script lang="ts">
  import ArrowUp from "phosphor-svelte/lib/ArrowUp";
  import Medal from "phosphor-svelte/lib/Medal";
  import PushPin from "phosphor-svelte/lib/PushPin";

  import { applyCensoring } from "../../functions/util/censorText";
  import { withoutBots } from "../../functions/util/isBot";
  import { formatCount } from "../../functions/util/format";
  import { editor } from "../../lib/editor.svelte";
  import type { MoreChildren, RedditComment } from "../../types/reddit";
  import Avatar from "./Avatar.svelte";
  import Comment from "./Comment.svelte";
  import FlairBadge from "./FlairBadge.svelte";
  import Username from "./Username.svelte";

  // `level` is the depth within the image (0 for the first comment shown),
  // not reddit's absolute depth, so permalinks to deep comments still render.
  let {
    data,
    postUtc,
    level = 0,
  }: {
    data: RedditComment | MoreChildren;
    postUtc: number;
    level?: number;
  } = $props();

  // Anything that isn't a comment is a "more children" stub, out of scope.
  const comment = $derived(
    data.type === "comment" && level <= editor.replyDepth ? data : null
  );
  const timestamp = $derived(
    comment ? editor.commentTimestamp(comment.created_utc, postUtc) : ""
  );
  const replies = $derived(
    comment
      ? withoutBots(comment.replyTree, editor.hideBots)
          .filter((reply) => reply.type === "comment")
          .slice(0, editor.commentReplies)
      : []
  );
  const body = $derived(
    comment
      ? applyCensoring(comment.body_html, {
          subreddits: editor.isCensorSubreddits,
          usernames: editor.isCensorUsernames,
          style: editor.redactStyle,
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
    <div class="flex items-center justify-between gap-3 text-[13px] leading-5">
      <span class="flex min-w-0 flex-wrap items-center gap-x-2">
        {#if editor.showProfileIcons && !editor.isCensorUsernames}
          <Avatar
            name={comment.author}
            src={comment.authorIcon}
          />
        {/if}
        <span class="font-semibold text-ap-muted">
          <Username name={comment.author} />
        </span>
        {#if comment.is_submitter}
          <span class="rounded-[3px] bg-ap-line px-1 text-[11px] leading-4 font-semibold text-ap-text">OP</span>
        {/if}
        {#if comment.stickied}
          <span class="inline-flex text-ap-up"><PushPin size={13} weight="fill" /></span>
        {/if}
        {#if comment.flair && !editor.hideUserFlair}
          <FlairBadge flair={comment.flair} />
        {/if}
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
      {#if timestamp}
        <span class="shrink-0 whitespace-nowrap text-ap-muted">{timestamp}</span>
      {/if}
    </div>

    <div class="md mt-1 text-base leading-[22px]">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -- cleaned by parseThread -->
      {@html body}
    </div>

    {#each replies as reply (reply.id)}
      <Comment data={reply} {postUtc} level={level + 1} />
    {/each}
  </div>
{/if}
