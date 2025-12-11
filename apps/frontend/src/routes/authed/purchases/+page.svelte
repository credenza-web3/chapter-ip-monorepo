<script lang="ts">
  import ContentItem from './ContentItem.svelte'

  let { data: rawData } = $props()
  let data = $derived(rawData)

  let purchasesByType = $derived.by(() => {
    const lifeTimeLicense = data.purchases.filter((p) => p.licenseType === '0')
    const oneTimeLicense = data.purchases.filter((p) => p.licenseType === '2')
    return { lifeTimeLicense, oneTimeLicense }
  })
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex flex-col md:flex-row md:gap-6 gap-1 md:items-end mb-8">
    <h1 class="text-4xl font-bold">My Purchases</h1>
    <div>( Total Purchases: <span class="text-primary text-lg font-semibold">{data.purchases.length}</span> )</div>
  </div>

  {#if data.purchases.length === 0}
    <div class="alert p-7">
      <span>You haven't made any purchases yet.</span>
      <a href="/authed/publishers" class="btn btn-primary py-6 md:py-0">Browse Publishers</a>
    </div>
  {:else}
    <div class="flex flex-col md:flex-row gap-8 justify-between">
      <div>
        <h1 class="text-primary text-lg font-semibold mb-3">Life Time Purchases</h1>
        {#each purchasesByType.lifeTimeLicense as purchase, i}
          <ContentItem
            {purchase}
            trpcClient={data.trpcClient}
            onBlockFile={() => (data.purchases[i].isBlocked = true)}
          />
        {/each}
      </div>
      <div>
        <h1 class="text-primary text-lg font-semibold mb-3">One Time Purchases</h1>
        {#each purchasesByType.oneTimeLicense as purchase, i}
          <ContentItem
            {purchase}
            trpcClient={data.trpcClient}
            onBlockFile={() => (data.purchases[i].isBlocked = true)}
          />
        {/each}
      </div>
    </div>
  {/if}
</div>
