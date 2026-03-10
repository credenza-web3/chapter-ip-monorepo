<script lang="ts">
  import { formatDate } from '$lib/services/formatDate.js'
  import { onMount } from 'svelte'
  import { notify, ToastType } from '@repo/ui-components'
  import { r2Config } from '@repo/fe-services'
  import { sendTx } from '$lib/services/transaction'
  import { getFilePricing } from '../helper.js'

  let { data } = $props()
  const { items } = data.paginatedResponse ?? { items: [] }

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
      await sendTx(
        await data.contentContract?.setLicensePriceFiat?.populateTransaction(tokenId, '0', fulltimeLicensePrice * 100)!,
      )
      await sendTx(
        await data.contentContract?.setLicensePriceToken?.populateTransaction(
          tokenId,
          '0',
          fulltimeLicensePrice * 10 ** 6,
        )!,
      )
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
      await sendTx(
        await data.contentContract?.setLicensePriceFiat?.populateTransaction(tokenId, '2', onetimeLicensePrice * 100)!,
      )
      await sendTx(
        await data.contentContract?.setLicensePriceToken?.populateTransaction(
          tokenId,
          '2',
          onetimeLicensePrice * 10 ** 6,
        )!,
      )
      notify('One-time license price updated', ToastType.SUCCESS)
    } catch {
      notify('Failed to update license prices', ToastType.FAIL)
    } finally {
      isOnetimeLicensePriceLoading = false
    }
  }

  onMount(async () => {
    const tokenId = data.paginatedResponse?.items[0].tokenId

    const { fulltimeLicensePrice: fulltime, onetimeLicensePrice: onetime } = await getFilePricing(data.contentContract!, tokenId)
    fulltimeLicensePrice = fulltime
    onetimeLicensePrice = onetime
    if (fulltimeLicensePrice) isFulltimeLoaded = true
    if (onetimeLicensePrice) isOnetimeLoaded = true
  })

  const CONTENT_CONTRACT = import.meta.env.VITE_EVM_CONTENT_NFT_CONTRACT_ADDRESS
  const EXPLORER_LINK = 'https://testnet.snowtrace.io/nft'
</script>

<div class="card bg-base-100 shadow-md p-6">
  <div class="mb-12 text-center">
    <h1 class="text-4xl font-light text-gray-900">File Details</h1>
  </div>
  <div class="flex flex-col md:flex-row justify-between gap-6 md:px-7">
    {#if items?.length > 0}
      {#each items as item}
        <ul class="basis-1/2">
          <li><strong>Contract Address:</strong> {CONTENT_CONTRACT}</li>
          <li><strong>Token ID:</strong> {item.tokenId}</li>
          <li>
            <strong>Explorer link:</strong>
            <a
              class="text-blue-500 hover:underline"
              href={`${EXPLORER_LINK}/${CONTENT_CONTRACT}/${item.tokenId}`}
              target="_blank">{EXPLORER_LINK}/{CONTENT_CONTRACT}/{item.tokenId}</a
            >
          </li>
          <li><strong>Created:</strong> {formatDate(item.createdAt)}</li>
          {#if data.metadata?.image}
            <li>
              <strong>Image:</strong>
              <object data={data.metadata.image} type="image/jpeg" title="File" class="w-30 h-30 rounded-lg">
                <img src={r2Config.url + r2Config.defaultImage} alt="File" />
              </object>
            </li>
          {/if}
          <li><strong>Title:</strong> {data.metadata?.title || 'Untitled'}</li>
          <li><strong>Description:</strong> {data.metadata?.description || 'No description'}</li>
        </ul>
      {/each}
    {/if}
    <div class="basis-1/2">
      <h2 class="text-xl font-semibold mb-2">Prices</h2>

      <div class="space-y-3">
        {#if isFulltimeLoaded}
          <div class="flex items-end gap-2 justify-between">
            <label class="flex-col" for="fulltime">
              <span class="label-text pb-2">Full time pice ($)</span>
              <input
                id="fulltime"
                type="number"
                placeholder="Enter full time pice"
                class="input input-bordered"
                bind:value={fulltimeLicensePrice}
                step="0.01"
                min="0"
              />
            </label>
            <button
              onclick={handleUpdateFulltimeLicensePrice}
              disabled={isFulltimeLicensePriceLoading || isOnetimeLicensePriceLoading}
              class="btn btn-primary"
            >
              {#if isFulltimeLicensePriceLoading}
                <span class="loading loading-spinner loading-sm"></span>
                Saving...
              {:else}
                Update Prices
              {/if}
            </button>
          </div>
        {/if}
        {#if isOnetimeLoaded}
          <div class="flex items-end gap-2 justify-between">
            <label class="flex-col" for="onetime">
              <span class="label-text pb-2">One time pice ($)</span>
              <input
                id="onetime"
                type="number"
                placeholder="Enter one time pice"
                class="input input-bordered"
                bind:value={onetimeLicensePrice}
                step="0.01"
                min="0"
              />
            </label>
            <button
              onclick={handleUpdateOnetimeLicensePrice}
              disabled={isOnetimeLicensePriceLoading || isFulltimeLicensePriceLoading}
              class="btn btn-primary"
            >
              {#if isOnetimeLicensePriceLoading}
                <span class="loading loading-spinner loading-sm"></span>
                Saving...
              {:else}
                Update Prices
              {/if}
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
