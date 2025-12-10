<script lang="ts">
  let { children, data } = $props()
</script>

<span class="text-[10px]">User Address: {data.userAddress}</span>
{@render children?.()}
