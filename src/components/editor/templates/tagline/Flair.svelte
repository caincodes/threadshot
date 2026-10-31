<script lang="ts">
  import { darkFlairText, lightFlairText } from "../../../../styles/themes";
  import type { RedditFlair } from "../../../../types/reddit";
  import Caption from "../../../ui/Caption.svelte";
  import { proxiedImageSrc } from "../media/proxy";
  import BadgeContainer from "./BadgeContainer.svelte";

  let { flair }: { flair: RedditFlair } = $props();

  const textColor = $derived(
    flair.textColor === "dark" ? darkFlairText : lightFlairText
  );
</script>

<BadgeContainer
  style="background-color: {flair.backgroundColor}; border-color: {flair.backgroundColor}"
>
  {#if flair.img}
    <img
      class="flex size-[0.7em]"
      alt="flair icon"
      src={proxiedImageSrc(flair.img)}
    />
  {/if}
  <Caption style="color: {textColor}">{flair.text}</Caption>
</BadgeContainer>
