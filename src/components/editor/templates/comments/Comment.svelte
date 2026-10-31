<script lang="ts">
  import { applyCensoring } from "../../../../functions/util/censorText";
  import { editor } from "../../../../lib/editor.svelte";
  import type { MoreChildren, RedditComment } from "../../../../types/reddit";
  import Paragraph from "../../../ui/Paragraph.svelte";
  import Tagline from "../tagline/Tagline.svelte";
  import ChildIndent from "./ChildIndent.svelte";
  import Comment from "./Comment.svelte";

  let { data }: { data: RedditComment | MoreChildren } = $props();
</script>

<!-- Anything that isn't a comment is a "more children" stub, out of scope. -->
{#if data.type === "comment" && data.depth <= editor.replyDepth}
  {@const depth = data.depth ? data.depth : 0}
  {@const body = applyCensoring(data.body_html, {
    subreddits: editor.isCensorSubreddits,
    usernames: editor.isCensorUsernames,
  })}
  <div class="flex flex-col">
    <ChildIndent {depth}>
      <div class="mb-1 flex flex-col" style:margin-top="{depth === 0 ? 0 : 4}px">
        <div class="flex">
          <Tagline
            censorUser={editor.isCensorUsernames}
            count={data.awardCount}
            date={data.date}
            flair={data.flair}
            isSubmitter={data.is_submitter}
            score={data.scoreString}
            type="comment"
            username={data.author}
          />
        </div>
        <Paragraph html={body} style="color: {editor.theme.contrast[300]}" />
      </div>
    </ChildIndent>
    {#each data.replyTree.slice(0, editor.commentReplies) as reply (reply.id)}
      <Comment data={reply} />
    {/each}
  </div>
{/if}
