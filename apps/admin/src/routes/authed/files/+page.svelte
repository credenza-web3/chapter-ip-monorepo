<script lang="ts">
  import { goto } from '$app/navigation'

  let { data } = $props()
  let { items, cursor } = data.paginateResponse

  const openFile = (id: string) => {
    goto(`/authed/files/${id}`)
  }

  const formatDate = (d: string | Date) =>
    new Date(d).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
</script>

<div class="min-h-xl p-4">
  <div class="mb-12 text-center">
    <h1 class="text-4xl font-light text-gray-900">File list</h1>
  </div>

  <div class="overflow-x-auto">
    <table class="table">
      <thead>
        <tr>
          <th>#</th>
          <th>ID</th>
          <th>Sub</th>
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
            <td>{item.sub}</td>
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
