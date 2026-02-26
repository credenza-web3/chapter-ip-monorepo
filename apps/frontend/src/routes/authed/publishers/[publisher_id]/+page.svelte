<script lang="ts">
  import { authStore } from '$lib'
  import { getTokenMetadata } from '../../purchases/helper'
  import SearchInput from '$lib/components/SearchInput.svelte'
  import PurchaseSubscription from './PurchaseSubscription.svelte'
  import PublisherHeader from './components/PublisherHeader.svelte'
  import ContentGrid from './components/ContentGrid.svelte'

  let { data } = $props()

  let loading = $state(false)
  let searchQuery = $state('')
  let metadataCache = $state(new Map())

  const filteredContentItems = $derived(() =>
    data.contentItems.filter((item) => {
      const metadata = metadataCache.get(item.tokenId)
      const title = metadata?.title || ''

      return title.toLowerCase().includes(searchQuery.toLowerCase())
    }),
  )

  const cacheMetadata = async (tokenId: string, metadata: any) => {
    metadataCache.set(tokenId, metadata)
  }

  $effect(() => {
    data.contentItems.forEach(async (item: any) => {
      if (!metadataCache.has(item.tokenId)) {
        try {
          const metadata = await getTokenMetadata(authStore.state.accessToken!, item.tokenId)
          cacheMetadata(item.tokenId, metadata)
        } catch (error) {
          console.error('Error caching metadata:', error)
        }
      }
    })
  })
</script>

<div class="container mx-auto px-4 py-8">
  <PublisherHeader publisher={data.publisher} />

  {#if loading}
    <div class="flex items-center justify-center h-16">
      <span class="loading loading-dots loading-lg"></span>
    </div>
  {:else}
    <PurchaseSubscription hasMembership={true} />

    {#if data.contentItems.length > 1}
      <div class="mb-6">
        <SearchInput placeholder="Search products by title" bind:value={searchQuery} />
      </div>
    {/if}

    <ContentGrid contentItems={filteredContentItems()} {searchQuery} />
  {/if}
</div>
