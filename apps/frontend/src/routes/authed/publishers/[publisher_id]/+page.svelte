<script lang="ts">
  import { authStore } from '$lib'
  import { fetchContentTokenMeta } from '@repo/fe-services'
  import { initProvider, getSigner } from '@repo/fe-evm-provider'
  import SearchInput from '$lib/components/SearchInput.svelte'
  import PurchaseSubscription from './components/PurchaseSubscription.svelte'
  import PublisherHeader from './components/PublisherHeader.svelte'
  import ContentGrid from './components/ContentGrid.svelte'
  import { configStore, ContractName } from '$lib/stores/config.svelte'

  let { data } = $props()

  let loading = $state(false)
  let searchQuery = $state('')
  let metadataCache = $state(new Map())
  let contentContract = $state<any>(null)

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
          if (!contentContract) {
            await initProvider(authStore.state.accessToken!)
            const signer = await getSigner()
            contentContract = configStore.getContract(ContractName.CONTENT_NFT, signer)
          }
          const metadata = await fetchContentTokenMeta(contentContract, item.tokenId)
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
    <PurchaseSubscription publisherAddress={data.publisher.evmAddress} />

    {#if data.contentItems.length > 1}
      <div class="mb-6">
        <SearchInput placeholder="Search products by title" bind:value={searchQuery} />
      </div>
    {/if}

    {#if contentContract}
      <ContentGrid contentItems={filteredContentItems()} {searchQuery} {contentContract} />
    {/if}
  {/if}
</div>
