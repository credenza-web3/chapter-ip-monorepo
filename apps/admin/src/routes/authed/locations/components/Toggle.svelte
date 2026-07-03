<script lang="ts">
  let { checked = false, onToggle }: { checked: boolean; onToggle: () => void } = $props()
</script>

<button
  type="button"
  role="switch"
  aria-checked={checked}
  onclick={onToggle}
  class="relative inline-flex h-6 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out"
  class:bg-primary={checked}
  class:bg-[#ddd4cc]={!checked}
>
  <span
    class="pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out flex items-center justify-center"
    class:translate-x-6={checked}
    class:translate-x-0={!checked}
  >
    {#if checked}
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
        <path d="M1 4L3.5 6.5L9 1" stroke="#7C3AED" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    {:else}
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
        <path d="M1 1L7 7M7 1L1 7" stroke="#71707A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    {/if}
  </span>
</button>
