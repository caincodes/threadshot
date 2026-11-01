<script lang="ts" generics="T extends string">
  interface Props {
    label: string;
    options: readonly { value: T; text: string }[];
    value: T;
    class?: string;
  }

  let {
    label,
    options,
    value = $bindable(),
    class: className = "",
  }: Props = $props();
</script>

<div class={["option-row py-1", className]}>
  <span class="text-sm" id="seg-{label}">{label}</span>
  <div
    class="option-control flex overflow-hidden rounded-ui border border-line"
    aria-labelledby="seg-{label}"
    role="radiogroup"
  >
    {#each options as option (option.value)}
      <button
        class={[
          "min-w-14 cursor-pointer px-2.5 text-sm font-medium transition-colors duration-150",
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
