<script lang="ts">
  import { editor } from "../../../../lib/editor.svelte";
  import { proxiedImageSrc } from "./proxy";

  let { src }: { src: string } = $props();
</script>

<img
  class="rounded-lg border border-gray-200"
  alt="content"
  src={proxiedImageSrc(src)}
  style:height={editor.imageScale}
  style:width={editor.imageScale}
/>
