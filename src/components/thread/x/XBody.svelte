<script lang="ts">
  import { applyCensoring } from "../../../functions/util/censorText";
  import { editor } from "../../../lib/editor.svelte";
  import type { XPost } from "../../../types/x";
  import Username from "../Username.svelte";
  import XCard from "./XCard.svelte";
  import XMediaGrid from "./XMediaGrid.svelte";
  import XQuoted from "./XQuoted.svelte";

  // A post's text and attachments, shared by the main post, the one it replies
  // to and its replies. Only the main post's text can be cut to a snippet or
  // left out, as a Reddit post's can.
  let {
    post,
    isLarge = false,
    showReplyingTo = false,
  }: { post: XPost; isLarge?: boolean; showReplyingTo?: boolean } = $props();

  const html = $derived.by(() => {
    if (isLarge && editor.postBody === "off") {
      return "";
    }
    if (isLarge && editor.postBody === "snippet" && editor.bodySnippet) {
      return editor.bodySnippet;
    }
    return (editor.showFullText && post.fullHtml) || post.html;
  });
  const body = $derived(
    applyCensoring(html, {
      usernames: false,
      subreddits: false,
      handles: editor.isCensorUsernames,
      style: editor.redactStyle,
    })
  );
</script>

{#if showReplyingTo && post.replyingTo}
  <p class="mt-1 text-[15px] text-ap-muted">
    Replying to <span class="text-ap-link"
      ><Username name={post.replyingTo} prefix="@" /></span
    >
  </p>
{/if}
{#if body}
  <div
    class={[
      "md",
      isLarge ? "mt-3 text-[17px] leading-6" : "mt-0.5 text-[15px] leading-5",
    ]}
    data-post-body={isLarge ? "" : undefined}
  >
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- cleaned by fetchXPost -->
    {@html body}
  </div>
{/if}
{#if post.media.length}
  <div class="mt-3"><XMediaGrid isEditable={isLarge} media={post.media} /></div>
{:else if post.card}
  <div class="mt-3"><XCard card={post.card} /></div>
{/if}
{#if post.quoted}
  <div class="mt-3"><XQuoted isEditable={isLarge} post={post.quoted} quotedBy={post} /></div>
{/if}
