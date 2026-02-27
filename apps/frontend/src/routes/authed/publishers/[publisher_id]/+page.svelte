<script lang="ts">
  import { authStore } from '$lib'
  import { fetchContentTokenMeta } from '@repo/fe-services'
  import { ethers, initProvider, getSigner } from '@repo/fe-evm-provider'
  import { abi as content_abi } from '@credenza3/contracts/artifacts/ContentNftContract.json'
  import SearchInput from '$lib/components/SearchInput.svelte'
  import PurchaseSubscription from './components/PurchaseSubscription.svelte'
  import PublisherHeader from './components/PublisherHeader.svelte'
  import ContentGrid from './components/ContentGrid.svelte'

  let { data } = $props()

  let loading = $state(false)
  let searchQuery = $state('')
  let metadataCache = $state(new Map())
  let contentContract: any = null

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
            contentContract = new ethers.Contract(
              import.meta.env.VITE_EVM_CONTENT_NFT_CONTRACT_ADDRESS,
              content_abi,
              signer,
            )
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
    <PurchaseSubscription hasMembership={false} />

    {#if data.contentItems.length > 1}
      <div class="mb-6">
        <SearchInput placeholder="Search products by title" bind:value={searchQuery} />
      </div>
    {/if}

    <ContentGrid contentItems={filteredContentItems()} {searchQuery} />
  {/if}
</div>
