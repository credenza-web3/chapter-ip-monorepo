<script lang="ts">
  import ContentItem from './ContentItem.svelte'
  import Users from '$lib/assets/users_icon.svg'

  let { data: rawData } = $props()

  let data = $derived(rawData)
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex flex-col md:gap-6 gap-1 mb-8">
    <h1 class="text-4xl font-bold">My Purchases</h1>
    <div>
      Total purchases to date <span class="text-lg font-semibold"
        >({[...data.onetimeLicenses, ...data.lifetimeLicenses].length})</span
      >
    </div>
  </div>

  {#if !data.lifetimeLicenses.length && !data.onetimeLicenses.length}
    <div class="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-300 rounded-lg">
      <img src={Users} alt="Empty" class="size-11 mb-4" />
      <p class="text-lg font-medium text-gray-700 mb-8">You haven't made any purchases yet.</p>
      <a
        href="/authed/publishers"
        class="bg-indigo-600 hover:bg-white hover:border hover:border-gray-400 text-white hover:text-indigo-600  font-semibold py-3 px-12 rounded-lg transition-colors"
        >Browse Publishers</a
      >
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
    </div>
  {/if}
</div>
