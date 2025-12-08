<script lang="ts">
  let { data } = $props()

  const onGetFileUrl = async (key: string, licenseTokenId: string) => {
    console.log(key, licenseTokenId);
    try {
      const { url } = await data.trpcClient!.files.getContentLink.query({
        licenseTokenId,
        key,
      })


      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.location.href = url;
      }
    } catch (error) {
      console.error('Error fetching file URL:', error)
    }
  }
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold mb-8">My Purchases</h1>

  {#if data.purchases.length === 0}
    <div class="alert">
      <span>You haven't made any purchases yet.</span>
      <a href="/authed/publishers" class="btn btn-sm btn-primary">Browse Publishers</a>
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-4">
      {#each data.purchases as purchase}
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div class="flex-1">
                <h3 class="card-title">{purchase.metadata.name}</h3>
              </div>
              <div class="flex flex-col sm:flex-row gap-2">
                {#if purchase.isBlocked}
                  <button class="btn btn-sm btn-outline btn-error">Already used</button>
                {:else}
                  <button
                    class="btn btn-sm btn-outline"
                    onclick={() => onGetFileUrl(purchase.metadata.key, String(purchase.licenseTokenId))}
                  >
                    Get file link
                  </button>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <div class="stats shadow mt-8 w-full">
      <div class="stat">
        <div class="stat-title">Total Purchases</div>
        <div class="stat-value">{data.purchases.length}</div>
      </div>
    </div>
  {/if}
</div>
