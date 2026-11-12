<script lang="ts">
  let { label }: { label: string } = $props();
</script>

<span
  class="pointer-events-none absolute bottom-2 left-2 rounded-[4px] bg-black/70 px-1 text-[11px] font-bold text-white"
  >{label}</span
>
