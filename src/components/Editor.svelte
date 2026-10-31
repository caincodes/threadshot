<script lang="ts">
  import {
    BOOKMARK_ACK,
    BOOKMARK_MESSAGE,
    REDDIT_ORIGINS,
  } from "../lib/bookmarklet";
  import { countBotComments } from "../functions/util/isBot";
  import { credentials } from "../lib/credentials.svelte";
  import { editor } from "../lib/editor.svelte";
  import {
    fetchRedditData,
    isRawThread,
    loadSampleData,
    parseThread,
    RedditRequestError,
    type RawThread,
    type RedditData,
  } from "../lib/redditData";
  import { decodeThread, THREAD_FRAGMENT } from "../lib/threadLink";
  import Connect from "./Connect.svelte";
  import Controls from "./editor/Controls.svelte";
  import ShareImage from "./thread/ShareImage.svelte";
  import Spinner from "./ui/Spinner.svelte";

  const params = new URLSearchParams(window.location.search);
  const subreddit = params.get("sub");
  const postId = params.get("postId");
  const shareCode = params.get("share");
  const commentId = params.get("commentId");
  const isSample = params.get("sample") === "1";
  // Opened by the bookmark or Safari extension, which post the thread over, or
  // by the iOS Shortcut, which puts it in the URL fragment.
  const isFromBookmark = params.get("from") === "reddit";
  const bookmarkNonce = params.get("n");

  const hasTarget = Boolean(subreddit && (postId || shareCode));
  // A post to load from Reddit needs the visitor's own credentials.
  const needsCredentials = $derived(
    hasTarget && !isSample && !isFromBookmark && credentials.value === null
  );

  // The preview is a fixed 390px (phone) wide so exports are identical everywhere;
  // on narrow screens it is only scaled down for viewing.
  const PREVIEW_WIDTH = 390;
  let frameWidth = $state(PREVIEW_WIDTH);
  const zoom = $derived(Math.min(1, frameWidth / PREVIEW_WIDTH));

  let data = $state<RedditData>();
  let isLoading = $state(true);
  let errorMessage = $state("");
  let isCredentialError = $state(false);
  let received = $state<RawThread>();

  // A link can't prove where it came from, so unlike a window message this data
  // may be crafted by anyone. parseThread cleans its HTML before it is rendered.
  $effect(() => {
    const { hash } = window.location;
    if (!isFromBookmark || !hash.startsWith(THREAD_FRAGMENT)) {
      return;
    }
    decodeThread(hash.slice(THREAD_FRAGMENT.length))
      .then((thread) => {
        received = thread;
      })
      .catch(() => {
        errorMessage = "That link did not contain a Reddit thread this app can read.";
        isLoading = false;
      });
  });

  // Only pages on reddit.com may send data, and only a well-formed thread is used.
  $effect(() => {
    if (!isFromBookmark) {
      return;
    }
    const onMessage =(event: MessageEvent) => {
      if (
        !REDDIT_ORIGINS.has(event.origin) ||
        event.data?.type !== BOOKMARK_MESSAGE ||
        !bookmarkNonce ||
        event.data.nonce !== bookmarkNonce ||
        !isRawThread(event.data.data)
      ) {
        return;
      }
      received = event.data.data;
      event.source?.postMessage(BOOKMARK_ACK, { targetOrigin: event.origin });
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  });

  $effect(() => {
    if (!received) {
      return;
    }
    try {
      data = parseThread(received, editor.commentSort);
      errorMessage = "";
    } catch {
      errorMessage = "That page did not contain a Reddit thread this app can read.";
    }
    isLoading = false;
  });

  $effect(() => {
    if (isFromBookmark) {
      return;
    }
    if (isSample) {
      data = loadSampleData(editor.commentSort);
      isLoading = false;
      return;
    }

    const ownCredentials = credentials.value;
    if (!subreddit || !(postId || shareCode) || !ownCredentials) {
      return;
    }

    const controller = new AbortController();
    isLoading = true;
    errorMessage = "";
    isCredentialError = false;

    fetchRedditData(
      { subreddit, postId, commentId, shareCode },
      editor.commentSort,
      ownCredentials,
      controller.signal
    )
      .then((result) => {
        data = result;
        isLoading = false;
      })
      .catch((error: Error) => {
        if (!controller.signal.aborted) {
          errorMessage = error.message;
          isCredentialError =
            error instanceof RedditRequestError && error.code === "credentials";
          isLoading = false;
        }
      });

    return () => controller.abort();
  });
</script>

{#if !isSample && !isFromBookmark && !hasTarget}
  <div class="mx-auto w-full max-w-[1280px] px-4 py-16 lg:px-8">
    <div class="max-w-xl">
      <h1 class="heading text-3xl">
        No thread selected
      </h1>
      <p class="mt-3 text-ink-2">
        Send a post here from Reddit with the iOS Shortcut, Safari extension or
        bookmark.
      </p>
      <div class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
        <a class="btn btn-primary" href="/">Choose how to send a post</a>
        <a class="link" href="/generate?sample=1">Try a sample post</a>
      </div>
    </div>
  </div>
{:else if needsCredentials}
  <div class="mx-auto w-full max-w-[1280px] px-4 py-12 lg:px-8">
    <div class="max-w-xl">
      <h1 class="heading text-3xl">
        Add a key to load this post
      </h1>
      <p class="mt-3 text-ink-2">
        Links only load with your own Reddit key. No key?
        <a class="link" href="/#no-key">Send the post from Reddit instead</a>.
      </p>
      <div class="mt-6 border border-line p-5"><Connect isEmbedded /></div>
    </div>
  </div>
{:else}
  <div
    class="mx-auto grid w-full max-w-[1280px] gap-6 px-4 py-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start lg:px-8"
  >
    <aside class="order-2 lg:sticky lg:top-6 lg:order-1">
      <Controls
        canDownload={Boolean(data) && !errorMessage}
        botCount={data ? countBotComments(data[1]) : 0}
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
          <Spinner />
          {isFromBookmark
            ? "Waiting for the thread from Reddit. If nothing arrives, send it again."
            : "Loading thread"}
        </div>
      {/if}

      {#if errorMessage}
        <div class="mx-auto max-w-lg py-10" role="alert">
          <h1 class="heading text-2xl">
            Could not load this thread
          </h1>
          <p class="mt-3 text-ink-2">{errorMessage}</p>
          {#if isCredentialError}
            <div class="mt-6"><Connect editing /></div>
          {/if}
          <p class="mt-4">
            <a class="link" href="/#no-key">Send the post from Reddit instead</a>
          </p>
        </div>
      {/if}
    </section>
  </div>
{/if}
