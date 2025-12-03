<script lang="ts">
  import { formatDate } from '$lib/services/formatDate.js'

  let { data } = $props()
  let { items } = data.paginatedResponse
</script>

<div class="p-4 min-h-xl">
  <div class="mb-12 text-center">
    <h1 class="text-4xl font-light text-gray-900">File Details</h1>
  </div>
  {#if items.length > 0}
    {#each items as item}
      <ul class="space-y-2">
        <li><strong>ID:</strong> {item.id}</li>
        <li><strong>Sub:</strong> {item.sub}</li>
        <li><strong>Bucket:</strong> {item.bucket}</li>
        <li><strong>Key:</strong> {item.key}</li>
        <li><strong>Token ID:</strong> {item.tokenId}</li>
        <li><strong>Created:</strong> {formatDate(item.createdAt)}</li>
        <li><strong>Updated:</strong>{formatDate(item.updatedAt)}</li>
      </ul>
    {/each}
  {/if}
</div>
