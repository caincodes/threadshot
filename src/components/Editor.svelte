<script lang="ts">
  import { editor } from "../lib/editor.svelte";
  import { fetchRedditData, type RedditData } from "../lib/redditData";
  import EditorCanvas from "./editor/EditorCanvas.svelte";
  import EditorInterface from "./editor/EditorInterface.svelte";

  const params = new URLSearchParams(window.location.search);
  const subreddit = params.get("sub");
  const postId = params.get("postId");
  const commentId = params.get("commentId");

  let data = $state<RedditData>();
  let isLoading = $state(true);
  let errorMessage = $state("");

  $effect(() => {
    if (!subreddit || !postId) {
      return;
    }

    const controller = new AbortController();
    data = undefined;
    isLoading = true;
    errorMessage = "";

    fetchRedditData(
      subreddit,
      postId,
      commentId,
      editor.commentSort,
      controller.signal
    )
      .then((result) => {
        data = result;
        isLoading = false;
      })
      .catch((error: Error) => {
        if (!controller.signal.aborted) {
          errorMessage = error.message;
          isLoading = false;
        }
      });

    return () => controller.abort();
  });
</script>

{#if subreddit && postId}
  <div
    class="grid max-h-[calc(100vh-96px)] max-w-screen animate-fade-in grid-cols-[repeat(auto-fit,minmax(min(100%,500px),1fr))] items-center gap-3"
  >
    <EditorInterface />
    <EditorCanvas
      comments={data?.[1]}
      {errorMessage}
      {isLoading}
      submission={data?.[0]}
    />
  </div>
{/if}
