<script lang="ts">
  let { onClose, children } = $props()
</script>

<div role="dialog" class="z-20 flex justify-center items-center fixed top-5 bottom-5 left-0 right-0 mx-3">
  <div class="flex flex-col max-w-xl relative bg-[#fafafa] rounded-md w-full overflow-y-scroll max-h-screen border border-gray-200">
    <button
      type="button"
      class="btn btn-xs bg-neutral-700 text-white rounded-none px-[6px] absolute right-2 top-2"
      onclick={onClose}>✕</button
    >
    <div class="px-6 py-7">
      {@render children()}
    </div>
  </div>
</div>
