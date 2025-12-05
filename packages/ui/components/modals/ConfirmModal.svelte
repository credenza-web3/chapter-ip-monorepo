<script lang="ts">
  import Base from './Base.svelte'

  let { text, redirectTo, onClose } = $props()
</script>

<Base {onClose}>
  <div class="flex flex-col gap-3 items-center">
    <h3 class="text-xl font-semibold">{text}</h3>
    <div class="w-full border-t border-gray-200 mt-4"></div>
    <div class="flex space-x-4 mt-8 justify-between md:justify-start">
      <button class="btn bg-black text-white px-6 md:px-12 rounded-md text-xs" onclick={onClose}>Cancel</button>
      <a href={redirectTo} class="btn bg-green-600 text-white px-6 md:px-12 rounded-md text-xs hover:bg-green-700">
        Confirm
      </a>
    </div>
  </div>
</Base>
