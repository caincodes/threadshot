<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  let {
    children,
    class: className,
    ...rest
  }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
  class={[
    "flex shrink items-center justify-center gap-2 rounded-lg border border-gray-200 px-1 py-0.5",
    className,
  ]}
  {...rest}
>
  {@render children?.()}
</div>
