<script lang="ts">
  import Caption from "../../../ui/Caption.svelte";
  import BadgeContainer from "./BadgeContainer.svelte";

  let { count }: { count: number } = $props();
</script>

<BadgeContainer>
  <Caption>{count} awards</Caption>
</BadgeContainer>
