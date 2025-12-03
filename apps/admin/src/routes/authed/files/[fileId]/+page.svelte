<script lang="ts">
  import { page } from '$app/stores'
  import { formatDate } from '$lib/services/formatDate.js'

  let { data } = $props()
  let { items } = data.paginateResponse
  const params = $page.params as { fileId: string }
  const fileId = params.fileId
  const fileData = items.find((item) => item.id === fileId)
</script>

<div class="p-4 min-h-xl">
  <div class="mb-12 text-center">
    <h1 class="text-4xl font-light text-gray-900">File Details</h1>
  </div>
  {#if fileData}
  <ul class="space-y-2">
    <li><strong>ID:</strong> {fileData?.id}</li>
    <li><strong>Sub:</strong> {fileData?.sub}</li>
    <li><strong>Bucket:</strong> {fileData?.bucket}</li>
    <li><strong>Key:</strong> {fileData?.key}</li>
    <li><strong>Token ID:</strong> {fileData?.tokenId}</li>
    <li><strong>Created:</strong> {formatDate(fileData.createdAt)}</li>
  </ul>
  {/if}
</div>
