<script lang="ts">
  interface Props {
    value: number;
    min: number;
    max: number;
    label: string;
  }

  let { value = $bindable(), min, max, label }: Props = $props();

  const handleInput = (event: Event & { currentTarget: HTMLInputElement }) => {
    const next = event.currentTarget.valueAsNumber;
    if (!Number.isNaN(next)) {
      value = Math.min(max, Math.max(min, next));
    }
  };
</script>

<input
  class="w-20 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm outline-none hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
  aria-label={label}
  {max}
  {min}
  oninput={handleInput}
  type="number"
  {value}
/>
