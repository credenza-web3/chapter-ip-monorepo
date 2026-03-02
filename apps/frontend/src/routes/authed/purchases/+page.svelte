<script lang="ts">
  import ContentItem from './ContentItem.svelte'

  let { data: rawData } = $props()

  let data = $derived(rawData)
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex flex-col md:flex-row md:gap-6 gap-1 md:items-end mb-8">
    <h1 class="text-4xl font-bold">My Purchases</h1>
    <div>
      ( Total Purchases: <span class="text-primary text-lg font-semibold"
        >{[...data.onetimeLicenses, ...data.lifetimeLicenses].length}</span
      > )
    </div>
    <div>
      ( Total Memberships: <span class="text-primary text-lg font-semibold"
        >{Object.keys(data.membershipContent).length}</span
      > )
    </div>
  </div>

  {#if !data.lifetimeLicenses.length && !data.onetimeLicenses.length && Object.keys(data.membershipContent).length === 0}
    <div class="alert p-7">
      <span>You haven't made any purchases yet.</span>
      <a href="/authed/publishers" class="btn btn-primary py-6 md:py-0">Browse Publishers</a>
    </div>
  {:else}
    <div class="flex flex-col gap-8 justify-between">
      <div class="border border-gray-200 rounded-lg p-3">
        <h1 class="text-primary text-lg font-semibold mb-3">Life Time Purchases</h1>
        {#if !data.lifetimeLicenses.length}
          No lifetime content purchased yet
        {/if}
        {#each data.lifetimeLicenses as purchase, i}
          <ContentItem {purchase} trpcClient={data.trpcClient} />
        {/each}
      </div>
      <div class="border border-gray-200 rounded-lg p-3">
        <h1 class="text-primary text-lg font-semibold mb-3">One Time Purchases</h1>
        {#if !data.onetimeLicenses.length}
          No onetime content purchased yet
        {/if}
        {#each data.onetimeLicenses as purchase, i}
          <ContentItem {purchase} trpcClient={data.trpcClient} />
        {/each}
      </div>

      <div class="border border-gray-200 rounded-lg p-3">
        <h1 class="text-primary text-lg font-semibold mb-3">Memberships Content</h1>
        {#if Object.keys(data.membershipContent).length === 0}
          No membership purchased yet
        {/if}
        {#each Object.entries(data.membershipContent) as [publisherId, publisherData]}
          <div class="mb-6">
            <h2 class="text-secondary text-md font-semibold mb-3">
              {publisherData.publisherTitle}
            </h2>
            <div class="ml-4 space-y-3">
              {#each publisherData.contentItems as purchase}
                <ContentItem {purchase} trpcClient={data.trpcClient} />
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
