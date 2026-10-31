<script lang="ts">
  import type { RedditFlair } from "../../types/reddit";
  import { proxiedImageSrc } from "./media/proxy";

  let { flair }: { flair: RedditFlair } = $props();

  // Reddit flair colors arrive as hex, "" or "transparent"; fall back to the
  // neutral grey reddit uses for unstyled flair.
  const hasBackground = $derived(
    Boolean(flair.backgroundColor) && flair.backgroundColor !== "transparent"
  );
  const textColor = $derived(
    hasBackground
      ? flair.textColor === "light"
        ? "#ffffff"
        : "#0f1a1c"
      : "var(--rd-text)"
  );
</script>

<span
  class="inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-xs leading-4 font-medium"
  style:background-color={hasBackground ? flair.backgroundColor : "var(--rd-pill)"}
  style:color={textColor}
>
  {#if flair.img}
    <img
      class="size-3.5 shrink-0"
      alt=""
      src={proxiedImageSrc(flair.img)}
    />
  {/if}
  {#if flair.text}<span class="truncate">{flair.text}</span>{/if}
</span>
