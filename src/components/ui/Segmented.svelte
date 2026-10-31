<script lang="ts" generics="T extends string">
  interface Props {
    label: string;
    options: readonly { value: T; text: string }[];
    value: T;
  }

  let { label, options, value = $bindable() }: Props = $props();
</script>

<div class="flex min-h-12 items-center justify-between gap-3">
  <span class="text-sm" id="seg-{label}">{label}</span>
  <div
    class="flex overflow-hidden rounded-ui border border-line"
    aria-labelledby="seg-{label}"
    role="radiogroup"
  >
    {#each options as option (option.value)}
      <button
        class={[
          "h-9 min-w-16 px-3 text-sm font-medium transition-colors duration-150",
          value === option.value
            ? "bg-ink text-white"
            : "bg-white text-ink hover:bg-canvas",
        ]}
        aria-checked={value === option.value}
        onclick={() => (value = option.value)}
        role="radio"
        type="button"
      >
        {option.text}
      </button>
    {/each}
  </div>
</div>
