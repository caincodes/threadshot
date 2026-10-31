<script lang="ts">
  import { editor } from "../../lib/editor.svelte";
  import type {
    MoreChildren,
    RedditComment,
    RedditSubmission,
  } from "../../types/reddit";
  import Comment from "./Comment.svelte";
  import Post from "./Post.svelte";

  interface Props {
    id?: string;
    submission: RedditSubmission;
    comments: (RedditComment | MoreChildren)[];
  }

  let { id, submission, comments }: Props = $props();
</script>

<!-- A 390px share card: phone width, exported at 3x for large, crisp type. -->
<div
  {id}
  class="ap w-[390px] bg-ap-bg font-export text-left text-ap-text"
  data-theme={editor.theme}
>
  <Post {submission} />

  {#if editor.showComments}
    {#each comments.slice(0, editor.topLevelComments) as comment (comment.id)}
      <Comment data={comment} />
    {/each}
  {/if}

  {#if editor.showAttribution}
    <p class="px-4 py-3 text-center text-xs text-ap-muted">
      Made with threadshot
    </p>
  {/if}
</div>
