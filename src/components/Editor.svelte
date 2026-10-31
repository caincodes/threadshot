<script lang="ts">
  import { editor } from "../lib/editor.svelte";
  import {
    fetchRedditData,
    loadSampleData,
    type RedditData,
  } from "../lib/redditData";
  import Controls from "./editor/Controls.svelte";
  import ShareImage from "./thread/ShareImage.svelte";
  import Spinner from "./ui/Spinner.svelte";

  const params = new URLSearchParams(window.location.search);
  const subreddit = params.get("sub");
  const postId = params.get("postId");
  const commentId = params.get("commentId");
  const isSample = params.get("sample") === "1";

  // The preview is a fixed 390px (phone) wide so exports are identical everywhere;
  // on narrow screens it is only scaled down for viewing.
  const PREVIEW_WIDTH = 390;
  let frameWidth = $state(PREVIEW_WIDTH);
  const zoom = $derived(Math.min(1, frameWidth / PREVIEW_WIDTH));

  let data = $state<RedditData>();
  let isLoading = $state(true);
  let errorMessage = $state("");

  $effect(() => {
    if (isSample) {
      data = loadSampleData(editor.commentSort);
      isLoading = false;
      return;
    }
    if (!subreddit || !postId) {
      return;
    }

    const controller = new AbortController();
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

{#if !isSample && (!subreddit || !postId)}
  <div class="mx-auto max-w-[1280px] px-4 py-16 lg:px-8">
    <h1 class="font-display text-3xl font-extrabold tracking-[-0.02em]">
      No thread selected
    </h1>
    <p class="mt-4"><a class="link" href="/">Paste a Reddit link</a></p>
  </div>
{:else}
  <div
    class="mx-auto grid w-full max-w-[1280px] gap-6 px-4 py-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start lg:px-8"
  >
    <aside class="order-2 lg:sticky lg:top-6 lg:order-1">
      <Controls
        canDownload={Boolean(data) && !errorMessage}
        isAlbum={data?.[0].linkType === "album"}
      />
    </aside>

    <section
      class="order-1 min-h-64 min-w-0 border border-line bg-canvas p-3 sm:p-6 lg:order-2"
    >
      {#if data}
        <div bind:clientWidth={frameWidth}>
          <div
            class="mx-auto w-fit"
            class:opacity-60={isLoading}
            style:zoom={zoom}
          >
            <ShareImage
              id="reddit-preview"
              comments={data[1]}
              submission={data[0]}
            />
          </div>
        </div>
      {:else if isLoading}
        <div class="flex min-h-52 items-center justify-center gap-3 text-ink-2">
          <Spinner /> Loading thread
        </div>
      {/if}

      {#if errorMessage}
        <div class="mx-auto max-w-lg py-10" role="alert">
          <h1 class="font-display text-2xl font-extrabold tracking-[-0.02em]">
            Could not load this thread
          </h1>
          <p class="mt-3 text-ink-2">{errorMessage}</p>
          <p class="mt-4"><a class="link" href="/">Try another link</a></p>
        </div>
      {/if}
    </section>
  </div>
{/if}
