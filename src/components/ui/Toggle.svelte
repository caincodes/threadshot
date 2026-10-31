<script lang="ts">
  interface Props {
    checked: boolean;
    label: string;
  }

  let { checked = $bindable(), label }: Props = $props();
</script>

<label class="relative inline-flex cursor-pointer items-center">
  <input
    class="peer sr-only"
    aria-label={label}
    role="switch"
    type="checkbox"
    bind:checked
  />
  <span
    class="h-4 w-7 rounded-full bg-gray-300 transition-colors peer-checked:bg-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/60 after:absolute after:top-0.5 after:left-0.5 after:size-3 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-3"
  ></span>
</label>
