<script lang="ts">
  import { formatDate } from '$lib/services/formatDate.js'
  import InlineEditField from './InlineEditField.svelte'
  import { UploadService } from '../../upload/services/upload.service.js'
  import PricesPanel from './PricesPanel.svelte'
  import { onMount } from 'svelte'

  let { data } = $props()
  const { items } = data.paginatedResponse ?? { items: [] }
  const { metadata } = data
  const uploadService = new UploadService()

  let fulltimeLicensePrice = $state(0)
  let onetimeLicensePrice = $state(0)
  let isFulltimeLoaded = $state(false)
  let isOnetimeLoaded = $state(false)
  let title = $state(metadata?.title ?? '')
  let description = $state(metadata?.description ?? '')

  onMount(async () => {
    if (data.contentContract && data.tokenId) {
      const ft = await data.contentContract.getLicensePriceFiat(data.tokenId, '0')
      fulltimeLicensePrice = Number(ft) / 100
      isFulltimeLoaded = true

      const ot = await data.contentContract.getLicensePriceFiat(data.tokenId, '2')
      onetimeLicensePrice = Number(ot) / 100
      isOnetimeLoaded = true
    }
  })

  const CONTENT_CONTRACT = import.meta.env.VITE_EVM_CONTENT_NFT_CONTRACT_ADDRESS
  const EXPLORER_LINK = 'https://testnet.snowtrace.io/nft'

  const handleSaveMetadata = (field: 'title' | 'description') => async (v: string) => {
    const trpcClient = uploadService.createTrpcClient()
    await trpcClient.files.uploadMetadata.mutate({
      tokenId: data.tokenId,
      metadata: { ...data.metadata, [field]: v },
    })
  }
</script>

<div class="p-10 min-h-xl card bg-base-100 shadow-md rounded-3xl">
  <div class="mb-12 text-left">
    <h1 class="text-2xl font-semibold text-dark">File Details</h1>
  </div>
  <div class="flex flex-col lg:flex-row gap-6 md:px-7">
    {#if items?.length > 0}
      <div class="max-w-120">
        {#each items as item (item.id)}
          <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <div class="flex justify-between items-start mb-3">
              <h3 class="font-semibold text-lg text-gray-800">
                <InlineEditField
                  bind:value={title}
                  placeholder="No title"
                  displayClass="font-semibold text-lg"
                  onSave={handleSaveMetadata('title')}
                />
              </h3>
              <span class="text-xs text-gray-500">
                {formatDate(item.createdAt)}
              </span>
            </div>
            <div class="w-32 h-32 p-2 flex items-center justify-center bg-gray-100 rounded-lg">
              {#if metadata?.image}
                <img src={metadata.image.replace('+xml', '')} alt="File" class="w-full h-full object-contain" />
              {:else}
                <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              {/if}
            </div>

            <p class="text-sm text-gray-600 mb-4">
              <InlineEditField
                bind:value={description}
                multiline={true}
                placeholder="No description"
                displayClass="text-sm text-gray-600 block"
                onSave={handleSaveMetadata('description')}
              />
            </p>

            <div class="space-y-2 text-sm">
              <div class="flex justify-between gap-3">
                <span class="text-gray-500">Contract</span>
                <span class="font-mono text-gray-800 truncate">
                  {CONTENT_CONTRACT}
                </span>
              </div>
              <div class="flex justify-between gap-3">
                <span class="text-gray-500">Token ID</span>
                <span class="font-semibold">{item.tokenId}</span>
              </div>
              <div class="flex justify-between gap-3">
                <span class="text-gray-500">Explorer</span>
                <a
                  class="text-primary hover:underline truncate max-w-45"
                  href={`${EXPLORER_LINK}/${CONTENT_CONTRACT}/${item.tokenId}`}
                  target="_blank"
                >
                  View
                </a>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
    <PricesPanel
      tokenId={data.tokenId ?? ''}
      contentContract={data.contentContract}
      bind:fulltimeLicensePrice
      bind:onetimeLicensePrice
      {isFulltimeLoaded}
      {isOnetimeLoaded}
    />
  </div>
</div>
