<script lang="ts">
  import { goto } from '$app/navigation'
  import { formatDate } from '$lib/services/formatDate.js'

  let { data } = $props()
  let { items, cursor } = data.paginatedResponse

  const openFile = (id: string) => {
    goto(`/authed/files/${id}`)
  }

</script>

<div class="min-h-xl p-4 card bg-base-100 shadow-md">
  <div class="mb-12 text-center">
    <h1 class="text-4xl font-light text-gray-900">File list</h1>
  </div>

  <div class="overflow-x-auto">
    <table class="table">
      <thead>
        <tr>
          <th>#</th>
          <th>ID</th>
          <th>Bucket</th>
          <th>Key</th>
          <th>Token ID</th>
          <th>Created</th>
        </tr>
      </thead>

      <tbody>
        {#each items as item, i (item.id)}
          <tr
            onclick={() => openFile(item.id)}
            class="cursor-pointer hover:bg-gray-100 transition-colors"
            role="button"
          >
            <th>{i + 1}</th>
            <td>{item.id}</td>
            <td>{item.bucket}</td>
            <td>{item.key}</td>
            <td>{item.tokenId}</td>
            <td>{formatDate(item.createdAt)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
