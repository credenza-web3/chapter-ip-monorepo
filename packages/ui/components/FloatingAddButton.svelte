<script lang="ts">
  let isOpen = $state(false)
  $effect(() => console.log(isOpen))
</script>

<button
  class="fixed top-[77px] right-[12px] z-50
         w-12 h-12 rounded-full
         bg-violet-600 hover:bg-violet-700
         text-white text-4xl font-light
         flex items-center justify-center
         shadow-lg pb-[5px] cursor-pointer"
  aria-label="Add"
  onclick={() => (isOpen = !isOpen)}
>
  +
</button>
