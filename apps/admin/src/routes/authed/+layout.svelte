<script lang="ts">
  let { children, data } = $props()
</script>

{#if data.userAddress}
  <span class="text-[10px]">
    <span class="font-semibold text-gray-900">User Address:</span>
    <span class="text-gray-500 ml-1">{data.userAddress}</span>
  </span>
{/if}
{@render children?.()}
