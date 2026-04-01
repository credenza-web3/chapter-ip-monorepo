<script lang="ts">
  import { formatDate } from '$lib/services/formatDate.js'
  import { onMount } from 'svelte'
  import { notify, ToastType } from '@repo/ui-components'
  import { sendTx } from '$lib/services/transaction'
  import { getFilePricing } from '../helper.js'

  let { data } = $props()
  const { items } = data.paginatedResponse ?? { items: [] }
  const { metadata } = data

  let fulltimeLicensePrice = $state(0)
  let onetimeLicensePrice = $state(0)
  let isFulltimeLoaded = $state(false)
  let isOnetimeLoaded = $state(false)

  let isFulltimeLicensePriceLoading = $state(false)
  let isOnetimeLicensePriceLoading = $state(false)

  const handleUpdateFulltimeLicensePrice = async () => {
    isFulltimeLicensePriceLoading = true
    try {
      const tokenId = data.tokenId
      const fiatTx = await data.contentContract?.setLicensePriceFiat?.populateTransaction(
        tokenId,
        '0',
        fulltimeLicensePrice * 100,
      )
      if (fiatTx) await sendTx(fiatTx)
      const tokenTx = await data.contentContract?.setLicensePriceToken?.populateTransaction(
        tokenId,
        '0',
        fulltimeLicensePrice * 10 ** 6,
      )
      if (tokenTx) await sendTx(tokenTx)
      notify('Full-time license price updated', ToastType.SUCCESS)
    } catch {
      notify('Failed to update license prices', ToastType.FAIL)
    } finally {
      isFulltimeLicensePriceLoading = false
    }
  }

  const handleUpdateOnetimeLicensePrice = async () => {
    isOnetimeLicensePriceLoading = true
    try {
      const tokenId = data.tokenId
      const fiatTx = await data.contentContract?.setLicensePriceFiat?.populateTransaction(
        tokenId,
        '2',
        onetimeLicensePrice * 100,
      )
      if (fiatTx) await sendTx(fiatTx)
      const tokenTx = await data.contentContract?.setLicensePriceToken?.populateTransaction(
        tokenId,
        '2',
        onetimeLicensePrice * 10 ** 6,
      )
      if (tokenTx) await sendTx(tokenTx)
      notify('One-time license price updated', ToastType.SUCCESS)
    } catch {
      notify('Failed to update license prices', ToastType.FAIL)
    } finally {
      isOnetimeLicensePriceLoading = false
    }
  }

  function handlePriceChange(setter: (v: number) => void) {
    return (e: Event) => {
      const target = e.target as HTMLInputElement
      if (!target?.value) return
      setter(Math.max(1, Number(target.value)))
    }
  }

  onMount(async () => {
    const tokenId = data.paginatedResponse?.items[0].tokenId
    if (!tokenId || !data.contentContract) return
    const { fulltimeLicensePrice: fulltime, onetimeLicensePrice: onetime } = await getFilePricing(
      data.contentContract!,
      tokenId,
    )

    fulltimeLicensePrice = fulltime
    onetimeLicensePrice = onetime
    if (fulltimeLicensePrice) isFulltimeLoaded = true
    if (onetimeLicensePrice) isOnetimeLoaded = true
  })

  const CONTENT_CONTRACT = import.meta.env.VITE_EVM_CONTENT_NFT_CONTRACT_ADDRESS
  const EXPLORER_LINK = 'https://testnet.snowtrace.io/nft'
</script>

<div class="p-10 min-h-xl card bg-base-100 shadow-md rounded-3xl">
  <div class="mb-12 text-left">
    <h1 class="text-2xl font-semibold text-[#202225]">File Details</h1>
  </div>
  <div class="flex flex-col lg:flex-row gap-6 md:px-7">
    {#if items?.length > 0}
      <div class="max-w-120">
        {#each items as item (item.id)}
          <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <div class="flex justify-between items-start mb-3">
              <h3 class="font-semibold text-lg text-gray-800">
                {metadata?.title || 'Untitled'}
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
              {metadata?.description || 'No description'}
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
                  class="text-[#6e4ff7] hover:underline truncate max-w-45"
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

    <div class="basis-1/2 p-4 bg-white rounded-lg border border-[#e5e5e5] shadow-sm max-w-120">
      <h2 class=" font-semibold mb-4 text-lg text-gray-800">Prices</h2>

      <div class="space-y-4">
        {#if isFulltimeLoaded}
          <div class="flex items-end gap-3 justify-between">
            <label class="flex flex-col flex-1" for="fulltime">
              <span class="text-gray-500 text-sm pb-1">Full-time price ($)</span>
              <input
                id="fulltime"
                type="number"
                placeholder="Enter full-time price"
                class="input input-bordered w-full"
                bind:value={fulltimeLicensePrice}
                min="1"
                oninput={handlePriceChange(v => fulltimeLicensePrice = v)}
              />
            </label>
            <button
              onclick={handleUpdateFulltimeLicensePrice}
              disabled={isFulltimeLicensePriceLoading || isOnetimeLicensePriceLoading}
              class="btn btn-primary bg-[#E4E8EB]"
            >
              {#if isFulltimeLicensePriceLoading}
                <span class="loading loading-spinner loading-sm mr-2"></span>
                Saving...
              {:else}
                Update Price
              {/if}
            </button>
          </div>
        {/if}

        {#if isOnetimeLoaded}
          <div class="flex items-end gap-3 justify-between">
            <label class="flex flex-col flex-1" for="onetime">
              <span class="text-gray-500 text-sm pb-1">One-time price ($)</span>
              <input
                id="onetime"
                type="number"
                placeholder="Enter one-time price"
                class="input input-bordered w-full"
                bind:value={onetimeLicensePrice}
                min="1"
                oninput={handlePriceChange(v => onetimeLicensePrice = v)}
              />
            </label>
            <button
              onclick={handleUpdateOnetimeLicensePrice}
              disabled={isOnetimeLicensePriceLoading || isFulltimeLicensePriceLoading}
              class="btn btn-primary bg-[#E4E8EB]"
            >
              {#if isOnetimeLicensePriceLoading}
                <span class="loading loading-spinner loading-sm mr-2"></span>
                Saving...
              {:else}
                Update Price
              {/if}
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
