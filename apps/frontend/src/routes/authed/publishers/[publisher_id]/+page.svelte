<script lang="ts">
  import SearchInput from '$lib/components/SearchInput.svelte'
  import PublisherHeader from './components/PublisherHeader.svelte'
  import ContentGrid from './components/ContentGrid.svelte'

  let { data } = $props()

  let loading = $state(false)
  let searchQuery = $state('')
</script>

<div class="container mx-auto px-4 py-8">
  <PublisherHeader publisher={data.publisher} />

  {#if loading}
    <div class="flex items-center justify-center h-16">
      <span class="loading loading-dots loading-lg"></span>
    </div>
  {:else}
    {#if data.contentItems.length > 1}
      <div class="mb-6">
        <SearchInput placeholder="Search products by title" bind:value={searchQuery} />
      </div>
    {/if}

    <ContentGrid contentItems={data.contentItems} {searchQuery} />
  {/if}
</div>
