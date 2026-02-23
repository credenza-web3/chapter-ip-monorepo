<script lang="ts">
  let { purchase, trpcClient } = $props()

  let isBlocked: boolean = $derived(purchase.isBlocked)

  let loading = $state(false)
  const onGetFileUrl = async () => {
    try {
      loading = true
      const { url } = await trpcClient!.files.getContentLink.query({
        licenseTokenId: String(purchase.licenseTokenId),
        key: purchase.metadata.key,
      })

      window.open(url, '_blank')
      if (purchase.licenseType === '2') {
        isBlocked = true
      }
    } catch (error) {
      console.error('Error fetching file URL:', error)
    } finally {
      loading = false
    }
  }

  const onGetTransactionReceipt = () => {
    window.open(`https://testnet.snowtrace.io/nft/${import.meta.env.VITE_EVM_LICENSE_NFT_CONTRACT_ADDRESS}/${purchase.licenseTokenId}`, '_blank')
  }
</script>

<div class="card bg-base-100 shadow-lg">
  <div class="card-body p-1">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center md:gap-8 gap-0">
      <div class="flex-1">
        <h3 class="card-title">{purchase.metadata.name}</h3>
      </div>

      <div class="flex flex-col sm:flex-row gap-2">
        {#if isBlocked}
          <button class="btn btn-sm btn-outline btn-error">Already used</button>
        {:else if loading}
          <div class="loading loading-dots"></div>
        {:else}
          <button class="btn btn-sm btn-outline" onclick={onGetFileUrl}> Get file link </button>
          <button class="btn btn-sm btn-outline" onclick={onGetTransactionReceipt}> Get transaction receipt </button>
        {/if}
      </div>
    </div>
  </div>
</div>
