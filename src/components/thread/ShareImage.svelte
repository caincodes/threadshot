<script lang="ts">
  import { withoutBots } from "../../functions/util/isBot";
  import { editor } from "../../lib/editor.svelte";
  import type {
    MoreChildren,
    RedditComment,
    RedditSubmission,
  } from "../../types/reddit";
  import Comment from "./Comment.svelte";
  import Post from "./Post.svelte";
  import Watermark from "./Watermark.svelte";

  interface Props {
    id?: string;
    submission: RedditSubmission;
    comments: (RedditComment | MoreChildren)[];
  }

  let { id, submission, comments }: Props = $props();

  const shownComments = $derived(
    editor.showComments
      ? withoutBots(comments, editor.hideBots)
          .slice(0, editor.topLevelComments)
          .filter((comment) => comment.type === "comment")
      : []
  );
  // With no comments the post's stats are the last line, so the watermark sits
  // beside them and wraps below if they leave no room. Otherwise it gets a row.
  const isPostLast = $derived(shownComments.length === 0);
</script>

<!-- A 390px share card: phone width, exported at 3x for large, crisp type. -->
<div
  {id}
  class="ap w-[390px] bg-ap-bg font-export text-left text-ap-text"
  data-theme={editor.theme}
>
  <Post {submission} {isPostLast} />

  {#each shownComments as comment (comment.id)}
    <Comment data={comment} />
  {/each}

  {#if !editor.hideWatermark && !isPostLast}
    <Watermark class="px-4 py-3 text-right" />
  {/if}
</div>
