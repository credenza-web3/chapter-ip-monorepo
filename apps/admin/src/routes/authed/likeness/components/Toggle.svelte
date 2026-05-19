<script lang="ts">
  let {
    checked = false,
    onToggle,
  }: {
    checked?: boolean
    onToggle: () => void
  } = $props()
</script>

<button
  type="button"
  onclick={onToggle}
  class="relative w-12 h-6 rounded-full transition-colors shrink-0 {checked ? 'bg-primary' : 'bg-[#ddd4cc]'}"
>
  <span
    class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform {checked
      ? 'translate-x-6'
      : 'translate-x-0'} flex items-center justify-center"
  >
    {#if checked}
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
        <path d="M1 4L3.5 6.5L9 1" stroke="#7C3AED" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    {:else}
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
        <path d="M1 1L7 7M7 1L1 7" stroke="#71707a" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    {/if}
  </span>
</button>
