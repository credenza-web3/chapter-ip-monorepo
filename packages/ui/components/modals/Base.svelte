<script lang="ts">
  import ArrowDown from '../../assets/arrow-down.svg'
  let { onClose, children, isBack } = $props()
</script>

<div role="dialog" class="z-20 flex justify-center items-center fixed top-5 bottom-5 left-0 right-0 mx-3">
  <div
    class="flex flex-col max-w-[900px] relative bg-[#f5f1ec] rounded-[12px] w-full overflow-y-scroll h-[350px] max-h-screen px-5 py-4"
  >
    {#if isBack}
      <button
        type="button"
        class="flex align-center justify-start text-xs text-[#70707080] gap-2 cursor-pointer"
        onclick={onClose}
      >
        <img src={ArrowDown} class="w-3 h-3 rotate-90" alt="" /> Back
      </button>
    {/if}
    <button
      type="button"
      class="text-[20px] text-[#70707080] rounded-none absolute right-3 top-2 cursor-pointer"
      onclick={onClose}>✕</button
    >
    <div class="px-6 py-7">
      {@render children()}
    </div>
  </div>
</div>
