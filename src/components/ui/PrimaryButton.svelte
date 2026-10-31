<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";

  import Heading from "./Heading.svelte";
  import Spinner from "./Spinner.svelte";

  let {
    children,
    class: className,
    isLoading = false,
    disabled,
    ...rest
  }: HTMLButtonAttributes & { isLoading?: boolean } = $props();
</script>

<button
  class={[
    "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary p-1 px-4 text-white",
    "hover:bg-primary-hover hover:text-surface-300 active:bg-primary-active active:text-surface-300",
    "disabled:cursor-not-allowed disabled:opacity-40",
    className,
  ]}
  disabled={disabled || isLoading}
  type="button"
  {...rest}
>
  {#if isLoading}
    <Spinner class="size-4 border-white/40 border-t-white" />
  {/if}
  <Heading>{@render children?.()}</Heading>
</button>
