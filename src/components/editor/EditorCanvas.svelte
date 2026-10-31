<script lang="ts">
  import { editor } from "../../lib/editor.svelte";
  import type {
    MoreChildren,
    RedditComment,
    RedditSubmission,
  } from "../../types/reddit";
  import Caption from "../ui/Caption.svelte";
  import Paragraph from "../ui/Paragraph.svelte";
  import Spinner from "../ui/Spinner.svelte";
  import Title from "../ui/Title.svelte";
  import Attribution from "./Attribution.svelte";
  import CommentHeader from "./CommentHeader.svelte";
  import RootComment from "./templates/comments/RootComment.svelte";
  import Submission from "./templates/submissions/Submission.svelte";

  interface Props {
    isLoading: boolean;
    errorMessage: string;
    submission: RedditSubmission | undefined;
    comments: (RedditComment | MoreChildren)[] | undefined;
  }

  let { submission, comments, isLoading, errorMessage }: Props = $props();

  const isError = $derived(Boolean(errorMessage));
  const isReady = $derived(!isLoading && !isError);
  const commentsBeingShown = $derived(
    Boolean(comments?.length && editor.showComments)
  );
</script>

<div class="flex max-w-screen flex-col items-center rounded-lg">
  <Title class="h-8">Image Preview</Title>
  <div
    id="reddit-preview"
    class={[
      "flex h-full max-h-[calc(100vh-96px-32px)] text-left",
      isReady ? "items-start justify-start" : "items-center justify-center",
    ]}
    style:background-color={editor.theme.background["100"]}
  >
    <div class="flex flex-col gap-2">
      {#if submission}
        <Submission {commentsBeingShown} {submission} />
        <Attribution />
      {/if}
      {#if comments && editor.showComments}
        <CommentHeader />
        {#each comments.slice(0, editor.topLevelComments) as comment (comment.id)}
          <RootComment data={comment} />
        {/each}
      {/if}
    </div>
    {#if isLoading}
      <Spinner />
    {/if}
    {#if isError}
      <div class="flex flex-col items-center gap-1 px-4">
        <Paragraph style="color: {editor.theme.accents[100]}">
          Something went wrong 😔
        </Paragraph>
        <Caption>{errorMessage}</Caption>
      </div>
    {/if}
  </div>
</div>
