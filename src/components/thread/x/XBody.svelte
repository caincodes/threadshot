<script lang="ts">
  import { applyCensoring } from "../../../functions/util/censorText";
  import { editor } from "../../../lib/editor.svelte";
  import type { XPost } from "../../../types/x";
  import Username from "../Username.svelte";
  import XCard from "./XCard.svelte";
  import XMediaGrid from "./XMediaGrid.svelte";
  import XQuoted from "./XQuoted.svelte";

  // A post's text and attachments, shared by the main post and the one it
  // replies to.
  let {
    post,
    isLarge = false,
    showReplyingTo = false,
  }: { post: XPost; isLarge?: boolean; showReplyingTo?: boolean } = $props();

  const body = $derived(
    applyCensoring(post.html, {
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
  >
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- cleaned by fetchXPost -->
    {@html body}
  </div>
{/if}
{#if post.media.length}
  <div class="mt-3"><XMediaGrid media={post.media} /></div>
{:else if post.card}
  <div class="mt-3"><XCard card={post.card} /></div>
{/if}
{#if post.quoted}
  <div class="mt-3"><XQuoted post={post.quoted} quotedBy={post} /></div>
{/if}
