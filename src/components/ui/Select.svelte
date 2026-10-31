<script lang="ts" generics="T extends string">
  import CaretDown from "phosphor-svelte/lib/CaretDown";

  interface Props {
    label: string;
    options: readonly { value: T; text: string }[];
    value: T;
    class: string;
  }

  let { label, options, value = $bindable(), class: width }: Props = $props();
</script>

<label class="option-row">
  <span class="text-sm">{label}</span>
  <span class={["relative", width]}>
    <select
      class="field option-control w-full appearance-none pr-6 pl-2 text-sm pointer-coarse:text-base"
      bind:value
    >
      {#each options as option (option.value)}
        <option value={option.value}>{option.text}</option>
      {/each}
    </select>
    <span
      class="pointer-events-none absolute inset-y-0 right-1.5 flex items-center"
    >
      <CaretDown size={14} weight="bold" />
    </span>
  </span>
</label>
