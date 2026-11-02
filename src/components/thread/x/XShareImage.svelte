<script lang="ts">
  import ChatCircle from "phosphor-svelte/lib/ChatCircle";
  import Heart from "phosphor-svelte/lib/Heart";
  import Repeat from "phosphor-svelte/lib/Repeat";

  import { formatCount } from "../../../functions/util/format";
  import { editor } from "../../../lib/editor.svelte";
  import type { XPost } from "../../../types/x";
  import Avatar from "../Avatar.svelte";
  import Watermark from "../Watermark.svelte";
  import XBody from "./XBody.svelte";
  import XName from "./XName.svelte";

  let { id, post }: { id?: string; post: XPost } = $props();

  // Pictures would give people away, so they go with redacted names.
  const showAvatars = $derived(
    editor.showXProfileIcons && !editor.isCensorUsernames
  );
  const parent = $derived(editor.showParentPost ? post.parent : undefined);
  const timestamp = $derived(editor.timestamp(post.createdUtc));
  const parentTimestamp = $derived(
    parent ? editor.commentTimestamp(parent.createdUtc, post.createdUtc) : ""
  );
</script>

{#snippet avatar(author: XPost["author"])}
  <Avatar
    name={author.handle}
    size={40}
    src={author.avatar}
    isSquare={author.isSquare}
  />
{/snippet}

<!-- The same 390px share card as a Reddit thread, laid out like a post on X. -->
<div
  {id}
  class="ap w-[390px] bg-ap-bg font-export text-left text-[15px] text-ap-text"
  data-theme={editor.theme}
>
  {#if parent}
    <div class="flex gap-3 px-4 pt-4">
      {#if showAvatars}
        <div class="flex shrink-0 flex-col items-center">
          {@render avatar(parent.author)}
          <span class="mt-1 w-0.5 flex-1 bg-ap-line"></span>
        </div>
      {/if}
      <div class={["min-w-0 flex-1 pb-4", !showAvatars && "border-b border-ap-line"]}>
        <div class="flex items-center gap-1">
          <XName author={parent.author} inline />
          {#if parentTimestamp}
            <span class="shrink-0 text-ap-muted">· {parentTimestamp}</span>
          {/if}
        </div>
        <XBody post={parent} />
      </div>
    </div>
  {/if}

  <article class={["px-4 pb-3", parent ? "pt-1" : "pt-4"]}>
    <header class="flex items-center gap-3">
      {#if showAvatars}
        {@render avatar(post.author)}
      {/if}
      <XName author={post.author} />
    </header>

    <XBody {post} isLarge showReplyingTo={!parent} />

    {#if timestamp}
      <p class="mt-3 text-ap-muted">{timestamp}</p>
    {/if}

    <footer
      class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-ap-line pt-3 text-[13px] font-medium text-ap-muted"
    >
      <span class="inline-flex items-center gap-1">
        <ChatCircle size={16} weight="bold" />
        {formatCount(post.replies)}
      </span>
      {#if post.reposts !== undefined}
        <span class="inline-flex items-center gap-1">
          <Repeat size={16} weight="bold" />
          {formatCount(post.reposts)}
        </span>
      {/if}
      <span class="inline-flex items-center gap-1">
        <span class="text-[#f91880]"><Heart size={16} weight="fill" /></span>
        {formatCount(post.likes)}
      </span>
      {#if !editor.hideWatermark}
        <Watermark class="ml-auto" />
      {/if}
    </footer>
  </article>
</div>
