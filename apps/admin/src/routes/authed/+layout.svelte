<script lang="ts">
  let { children, data } = $props()
</script>

{#if data.userAddress}
  <div class="text-[10px] flex flex-col md:flex-row md:justify-start items-center mb-4 mr-2">
    <span class="font-semibold text-gray-900">User Address:</span>
    <span class="text-gray-500 ml-1">{data.userAddress}</span>
  </div>
{/if}
<div class="">
  {@render children?.()}
</div>
