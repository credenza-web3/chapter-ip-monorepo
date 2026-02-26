<script lang="ts">
  import { goto } from '$app/navigation'
  import { formatDate } from '$lib/services/formatDate.js'
  import { fetchContentTokenMeta } from '@repo/fe-services'

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
          <th>Key</th>
          <th>Title</th>
          <th>description</th>
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
            <td>{item.key}</td>
            {#await fetchContentTokenMeta(data.contentContract!, item.tokenId)}
              <td>Loading title...</td>
              <td>Loading description...</td>
            {:then meta}
              <td>{meta.title || 'N/A'}</td>
              <td>{meta.description || 'N/A'}</td>
            {/await}

            <td>{formatDate(item.createdAt)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
