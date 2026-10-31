<script lang="ts">
  import type { RedditFlair } from "../../types/reddit";
  import { proxiedImageSrc } from "./media/proxy";

  let { flair }: { flair: RedditFlair } = $props();

  // Reddit flair colors arrive as hex, "" or "transparent"; fall back to a
  // neutral label when there is no usable background.
  const hasBackground = $derived(
    Boolean(flair.backgroundColor) && flair.backgroundColor !== "transparent"
  );
  const textColor = $derived(
    hasBackground
      ? flair.textColor === "light"
        ? "#ffffff"
        : "#0a0a0a"
      : "var(--ap-text)"
  );
</script>

<span
  class="inline-flex max-w-full items-center gap-1 rounded-md px-1.5 py-0.5 text-xs leading-4 font-semibold"
  style:background-color={hasBackground ? flair.backgroundColor : "var(--ap-line)"}
  style:color={textColor}
>
  {#if flair.img}
    <img class="size-3.5 shrink-0" alt="" src={proxiedImageSrc(flair.img)} />
  {/if}
  {#if flair.text}<span class="truncate">{flair.text}</span>{/if}
</span>
