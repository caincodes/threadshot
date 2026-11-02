<script lang="ts">
  import { editor } from "../../../lib/editor.svelte";
  import type { XAuthor } from "../../../types/x";
  import Redacted from "../Redacted.svelte";
  import Username from "../Username.svelte";
  import VerifiedBadge from "./VerifiedBadge.svelte";

  // `inline` puts the handle beside the name, as in a reply or quote.
  let { author, inline = false }: { author: XAuthor; inline?: boolean } =
    $props();
</script>

<span
  class={[
    "flex min-w-0",
    inline ? "items-center gap-x-1" : "flex-col",
  ]}
>
  <span class={["flex min-w-0 items-center gap-1 font-bold", inline && "shrink"]}>
    {#if !editor.isCensorUsernames}
      <span class="truncate">{author.name}</span>
    {:else if editor.redactStyle !== "hide"}
      <Redacted name={author.name} />
    {/if}
    <VerifiedBadge kind={author.verified} size={inline ? 15 : 17} />
  </span>
  <span class={["truncate text-ap-muted", inline && "shrink-[2]"]}
    ><Username name={author.handle} prefix="@" /></span
  >
</span>
