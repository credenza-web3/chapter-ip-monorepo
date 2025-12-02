<script lang="ts">
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
          <th>Updated</th>
        </tr>
      </thead>

      <tbody>
        {#each files as file, i}
          <tr>
            <th>{i + 1}</th>
            <td>{file.id}</td>
            <td>{file.sub}</td>
            <td>{file.bucket}</td>
            <td>{file.key}</td>
            <td>{file.tokenId}</td>
            <td>{file.createdAt.toLocaleString()}</td>
            <td>{file.updatedAt.toLocaleString()}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
