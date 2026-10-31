<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  let {
    children,
    class: className,
    ...rest
  }: HTMLAttributes<HTMLParagraphElement> = $props();
</script>

<p class={["text-xl font-bold", className]} {...rest}>{@render children?.()}</p>
