<script lang="ts">
  import { applyCensoring } from "../../../functions/util/censorText";
  import { editor } from "../../../lib/editor.svelte";
  import type { XPost } from "../../../types/x";
  import Avatar from "../Avatar.svelte";
  import XMediaGrid from "./XMediaGrid.svelte";
  import XName from "./XName.svelte";

  let { post }: { post: XPost } = $props();

  const timestamp = $derived(editor.timestamp(post.createdUtc));
  const body = $derived(
    applyCensoring(post.html, {
      usernames: false,
      subreddits: false,
      handles: editor.isCensorUsernames,
      style: editor.redactStyle,
    })
  );
</script>

<div class="overflow-hidden rounded-2xl border border-ap-line">
  <div class="px-3 pt-2.5 pb-3">
    <div class="flex items-center gap-1.5 text-[14px]">
      {#if editor.showXProfileIcons && !editor.isCensorUsernames}
        <Avatar
          name={post.author.handle}
          src={post.author.avatar}
          isSquare={post.author.isSquare}
        />
      {/if}
      <XName author={post.author} inline />
      {#if timestamp}
        <span class="shrink-0 text-ap-muted">· {timestamp}</span>
      {/if}
    </div>
    {#if body}
      <div class="md mt-1 text-[15px] leading-5">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -- cleaned by fetchXPost -->
        {@html body}
      </div>
    {/if}
  </div>
  {#if post.media.length}
    <XMediaGrid media={post.media} isFlush />
  {/if}
</div>
