<script lang="ts">
  import CaretDown from "phosphor-svelte/lib/CaretDown";

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

  const sortLabel = $derived(
    editor.commentSort.charAt(0).toUpperCase() + editor.commentSort.slice(1)
  );
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
</script>

<div
  {id}
  class="rd w-[640px] bg-rd-bg font-reddit text-left text-rd-text"
  data-theme={editor.theme}
>
  <Post {submission} />

  {#if editor.showComments && comments.length}
    <section class="px-4 pb-3">
      <div
        class="flex items-center gap-1 border-t border-rd-line pt-3 text-xs text-rd-muted"
      >
        Sort by:
        <span class="inline-flex items-center gap-0.5 font-semibold text-rd-text">
          {sortLabel}
          <CaretDown size={12} weight="bold" />
        </span>
      </div>
      {#each comments.slice(0, editor.topLevelComments) as comment (comment.id)}
        <Comment data={comment} />
      {/each}
    </section>
  {/if}

  {#if editor.showAttribution}
    <p class="px-4 pb-3 text-[11px] text-rd-muted">
      Captured with threadshot on {today}
    </p>
  {/if}
</div>
