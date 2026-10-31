<script lang="ts">
  import ChatCircle from "phosphor-svelte/lib/ChatCircle";
  import Medal from "phosphor-svelte/lib/Medal";
  import ShareFat from "phosphor-svelte/lib/ShareFat";

  import { applyCensoring } from "../../functions/util/censorText";
  import { formatAgo } from "../../functions/util/format";
  import { editor } from "../../lib/editor.svelte";
  import type { MoreChildren, RedditComment } from "../../types/reddit";
  import Avatar from "./Avatar.svelte";
  import Comment from "./Comment.svelte";
  import FlairBadge from "./FlairBadge.svelte";
  import Username from "./Username.svelte";
  import VoteBar from "./VoteBar.svelte";

  let { data }: { data: RedditComment | MoreChildren } = $props();

  // Anything that isn't a comment is a "more children" stub, out of scope.
  const comment = $derived(
    data.type === "comment" && data.depth <= editor.replyDepth ? data : null
  );
  const replies = $derived(
    comment
      ? comment.replyTree
          .slice(0, editor.commentReplies)
          .filter(
            (reply) =>
              reply.type === "comment" && reply.depth <= editor.replyDepth
          )
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
  <div class="flex gap-2 pt-3">
    <div class="flex w-7 shrink-0 flex-col items-center">
      <Avatar
        censored={editor.isCensorUsernames}
        kind="user"
        seed={comment.author}
      />
      {#if replies.length}
        <div class="mt-1 w-px flex-1 bg-rd-line"></div>
      {/if}
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-x-1.5 text-xs leading-7">
        <span class="font-semibold text-rd-text">
          <Username name={comment.author} />
        </span>
        {#if comment.is_submitter}
          <span class="font-bold text-rd-link">OP</span>
        {/if}
        {#if comment.flair}<FlairBadge flair={comment.flair} />{/if}
        <span class="text-rd-muted">&bull; {formatAgo(comment.created_utc)}</span>
        {#if comment.awardCount}
          <span class="inline-flex items-center gap-0.5 text-rd-muted">
            &bull; <Medal size={12} weight="fill" /> {comment.awardCount}
          </span>
        {/if}
      </div>

      <div class="md text-sm leading-[21px] text-rd-text">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -- reddit's own sanitized HTML -->
        {@html body}
      </div>

      <div class="mt-1 -ml-1 flex items-center gap-1 text-xs font-semibold text-rd-muted">
        <VoteBar score={comment.score} />
        <span class="inline-flex h-8 items-center gap-1.5 px-2">
          <ChatCircle size={16} weight="bold" />
          Reply
        </span>
        <span class="inline-flex h-8 items-center gap-1.5 px-2">
          <ShareFat size={16} weight="bold" />
          Share
        </span>
      </div>

      {#each replies as reply (reply.id)}
        <Comment data={reply} />
      {/each}
    </div>
  </div>
{/if}
