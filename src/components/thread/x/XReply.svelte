<script lang="ts">
  import ChatCircle from "phosphor-svelte/lib/ChatCircle";
  import Heart from "phosphor-svelte/lib/Heart";

  import { formatCount } from "../../../functions/util/format";
  import { editor } from "../../../lib/editor.svelte";
  import type { XPost } from "../../../types/x";
  import Avatar from "../Avatar.svelte";
  import XBody from "./XBody.svelte";
  import XName from "./XName.svelte";

  // A reply under the main post, laid out as X lists them.
  let { reply, postUtc }: { reply: XPost; postUtc: number } = $props();

  const showAvatar = $derived(
    editor.showXProfileIcons && !editor.isCensorUsernames
  );
  const timestamp = $derived(editor.commentTimestamp(reply.createdUtc, postUtc));
</script>

<div class="flex gap-3 border-t border-ap-line px-4 py-3">
  {#if showAvatar}
    <div class="shrink-0">
      <Avatar
        name={reply.author.handle}
        size={40}
        src={reply.author.avatar}
        isSquare={reply.author.isSquare}
      />
    </div>
  {/if}
  <div class="min-w-0 flex-1">
    <div class="flex items-center gap-1">
      <XName author={reply.author} inline />
      {#if timestamp}
        <span class="shrink-0 text-ap-muted">· {timestamp}</span>
      {/if}
    </div>
    <XBody post={reply} />
    <div class="mt-2 flex items-center gap-5 text-[13px] font-medium text-ap-muted">
      <span class="inline-flex items-center gap-1">
        <ChatCircle size={15} weight="bold" />
        {formatCount(reply.replies)}
      </span>
      <span class="inline-flex items-center gap-1">
        <Heart size={15} weight="bold" />
        {formatCount(reply.likes)}
      </span>
    </div>
  </div>
</div>
