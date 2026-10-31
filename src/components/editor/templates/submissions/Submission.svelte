<script lang="ts">
  import { editor } from "../../../../lib/editor.svelte";
  import type { RedditSubmission } from "../../../../types/reddit";
  import Title from "../../../ui/Title.svelte";
  import Tagline from "../tagline/Tagline.svelte";
  import SubmissionContent from "./SubmissionContent.svelte";

  interface Props {
    submission: RedditSubmission;
    commentsBeingShown: boolean;
  }

  let { submission, commentsBeingShown }: Props = $props();
</script>

<div
  class="flex flex-col gap-2 px-[18px]"
  style:padding-bottom="{commentsBeingShown ? 0 : 16}px"
>
  <Title style="color: {editor.theme.contrast[300]}">{submission.title}</Title>
  <Tagline
    censorSubreddit={editor.isCensorSubreddits}
    censorUser={editor.isCensorUsernames}
    count={submission.awardCount}
    date={submission.date}
    flair={submission.userFlair}
    score={submission.scoreString}
    subreddit={submission.subreddit_name_prefixed}
    type="submission"
    username={submission.author}
  />
  <SubmissionContent {submission} />
</div>
