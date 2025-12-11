<script lang="ts">
  let {purchase, trpcClient, onBlockFile } = $props()

  let loading = $state(false)
  const onGetFileUrl = async () => {
    try {
      loading = true
      const { url } = await trpcClient!.files.getContentLink.query({
        licenseTokenId: String(purchase.licenseTokenId),
        key: purchase.metadata.key,
      })

      const newWindow = window.open('', '_blank')
      if (newWindow) {
        newWindow.location.href = url
      }

      if (purchase.licenseType === '2') {
        onBlockFile()
      }
    } catch (error) {
      console.error('Error fetching file URL:', error)
    } finally {
      loading = false
    }
  }
</script>

<div class="card bg-base-100 shadow-lg">
  <div class="card-body p-1">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center md:gap-8 gap-0">
      <div class="flex-1">
        <h3 class="card-title">{purchase.metadata.name}</h3>
      </div>

      <div class="flex flex-col sm:flex-row gap-2">
        {#if purchase.isBlocked}
          <button class="btn btn-sm btn-outline btn-error">Already used</button>
        {:else if loading}
          <div class="loading loading-dots"></div>
        {:else}
          <button class="btn btn-sm btn-outline" onclick={onGetFileUrl}> Get file link </button>
        {/if}
      </div>
    </div>
  </div>
</div>
