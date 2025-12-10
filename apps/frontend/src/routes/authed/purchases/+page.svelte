<script lang="ts">
  import ContentItem from './ContentItem.svelte'

  let { data: rawData } = $props()
  let data = $state(rawData)
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold mb-8">My Purchases</h1>

  {#if data.purchases.length === 0}
    <div class="alert p-7">
      <span>You haven't made any purchases yet.</span>
      <a href="/authed/publishers" class="btn btn-primary py-6 md:py-0">Browse Publishers</a>
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-4">
      {#each data.purchases as purchase, i}
        <ContentItem {purchase} trpcClient={data.trpcClient} onBlockFile={() => (data.purchases[i].isBlocked = true)} />
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
