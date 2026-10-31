<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  let {
    children,
    class: className,
    bold = false,
    ...rest
  }: HTMLAttributes<HTMLParagraphElement> & { bold?: boolean } = $props();
</script>

<p
  class={["text-xs break-keep", bold ? "font-bold" : "font-extralight", className]}
  {...rest}
>
  {@render children?.()}
</p>
