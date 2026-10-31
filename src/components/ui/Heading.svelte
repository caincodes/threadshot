<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  let {
    children,
    class: className,
    ...rest
  }: HTMLAttributes<HTMLParagraphElement> = $props();
</script>

<p class={["text-base font-semibold", className]} {...rest}>
  {@render children?.()}
</p>
