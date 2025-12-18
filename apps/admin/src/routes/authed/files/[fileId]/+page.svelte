<script lang="ts">
  import { authStore } from '$lib/auth/index.js'
  import { formatDate } from '$lib/services/formatDate.js'
  import { ethers, initProvider } from '@repo/fe-evm-provider'
  import { onMount } from 'svelte'
  import { abi as content_abi } from '@credenza3/contracts/artifacts/ContentNftContract.json'
  import { forwardTransaction } from '@repo/fe-services'
  import { notify, ToastType } from '@repo/ui-components'
  import { getTokenPrice } from '../getTokenPrice.js'

  let { data } = $props()
  const { items } = data.paginatedResponse
  type PopulatedTx = Awaited<ReturnType<typeof contentContract.setLicensePriceFiat.populateTransaction>>

  let contentContract: any = $state(null)
  let fulltimeLicensePrice = $state(0)
  let onetimeLicensePrice = $state(0)
  let isFulltimeLoaded = $state(false)
  let isOnetimeLoaded = $state(false)

  let isFulltimeLicensePriceLoading = $state(false)
  let isOnetimeLicensePriceLoading = $state(false)

  let initialFulltimePrice = $state(0)
  let initialOnetimePrice = $state(0)

  const hasFulltimeChanged = $derived(fulltimeLicensePrice !== initialFulltimePrice)
  const hasOnetimeChanged = $derived(onetimeLicensePrice !== initialOnetimePrice)
  const hasAnyChanges = $derived(hasFulltimeChanged || hasOnetimeChanged)

  const sendTx = async (populatedTx: PopulatedTx) => {
    const { ethersProvider } = await getSignerAndProvider()
    const txHash = await forwardTransaction(populatedTx, {
      token: authStore.state.accessToken!,
      client_id: import.meta.env.VITE_CLIENT_ID,
      evm_wss: import.meta.env.VITE_CREDENZA_EVM_WSS,
    })
    const receipt = await ethersProvider.waitForTransaction(txHash)
    if (!receipt) throw new Error('Transaction failed')
    return receipt
  }

  const getSignerAndProvider = async () => {
    const provider = await initProvider(authStore.state.accessToken!)
    const ethersProvider = new ethers.BrowserProvider(provider)
    const signer = await ethersProvider.getSigner()
    return { provider, ethersProvider, signer }
  }
  const handleSaveChanges = async () => {
    try {
      const tokenId = data.tokenId

      if (hasFulltimeChanged) {
        isFulltimeLicensePriceLoading = true
        await sendTx(
          await contentContract.setLicensePriceFiat.populateTransaction(tokenId, '0', fulltimeLicensePrice * 100),
        )
        await sendTx(
          await contentContract.setLicensePriceToken.populateTransaction(tokenId, '0', fulltimeLicensePrice * 10 ** 6),
        )
        initialFulltimePrice = fulltimeLicensePrice
      }

      if (hasOnetimeChanged) {
        isOnetimeLicensePriceLoading = true
        await sendTx(
          await contentContract.setLicensePriceFiat.populateTransaction(tokenId, '2', onetimeLicensePrice * 100),
        )
        await sendTx(
          await contentContract.setLicensePriceToken.populateTransaction(tokenId, '2', onetimeLicensePrice * 10 ** 6),
        )
        initialOnetimePrice = onetimeLicensePrice
      }

      notify('Prices updated successfully', ToastType.SUCCESS)
    } catch {
      notify('Failed to update license prices', ToastType.FAIL)
    } finally {
      isFulltimeLicensePriceLoading = false
      isOnetimeLicensePriceLoading = false
    }
  }

  const handleUpdateFulltimeLicensePrice = async () => {
    isFulltimeLicensePriceLoading = true
    try {
      const tokenId = data.tokenId
      await sendTx(
        await contentContract.setLicensePriceFiat.populateTransaction(tokenId, '0', fulltimeLicensePrice * 100),
      )
      await sendTx(
        await contentContract.setLicensePriceToken.populateTransaction(tokenId, '0', fulltimeLicensePrice * 10 ** 6),
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
        await contentContract.setLicensePriceFiat.populateTransaction(tokenId, '2', onetimeLicensePrice * 100),
      )
      await sendTx(
        await contentContract.setLicensePriceToken.populateTransaction(tokenId, '2', onetimeLicensePrice * 10 ** 6),
      )
      notify('One-time license price updated', ToastType.SUCCESS)
    } catch {
      notify('Failed to update license prices', ToastType.FAIL)
    } finally {
      isOnetimeLicensePriceLoading = false
    }
  }

  onMount(async () => {
    const tokenId = data.paginatedResponse.items[0].tokenId
    const { signer } = await getSignerAndProvider()

    contentContract = new ethers.Contract(import.meta.env.VITE_EVM_CONTENT_NFT_CONTRACT_ADDRESS, content_abi, signer)
    fulltimeLicensePrice = Number(await contentContract.getLicensePriceFiat(tokenId, '0')) / 100
    onetimeLicensePrice = Number(await contentContract.getLicensePriceFiat(tokenId, '2')) / 100
    initialFulltimePrice = fulltimeLicensePrice
    initialOnetimePrice = onetimeLicensePrice
    if (fulltimeLicensePrice) isFulltimeLoaded = true
    if (onetimeLicensePrice) isOnetimeLoaded = true
  })
</script>

<div class="p-6 max-w-3xl">
  <h1 class="text-3xl font-light text-gray-900 mb-6">File details</h1>
  <div class="flex gap-10 p-6 bg-white w-fit">
    <img src="$lib/assets/file_icon.png" alt="File Icon" class="w-32 h-32 object-contain border border-gray-200" />
    {#each items as item}
      <div class="grid grid-cols-2 gap-3 text-sm text-gray-700">
        {#each [{ label: 'ID', value: item.id }, { label: 'Sub', value: item.sub }, { label: 'Bucket', value: item.bucket }, { label: 'Type', value: 'Book' }, { label: 'Key', value: item.key }, { label: 'Token ID', value: item.tokenId }, { label: 'Date created', value: formatDate(item.createdAt) }, { label: 'Last updated on', value: formatDate(item.updatedAt) }] as field}
          <div>
            <p class="text-gray-400 uppercase text-xs">{field.label}</p>
            <p class="break-all">{field.value}</p>
          </div>
        {/each}
      </div>
    {/each}
    <span class="border-b my-6"></span>
  </div>

  <div class="mt-10">
    <h2 class="text-xl font-semibold text-gray-900 mb-4">General details</h2>

    <div class="space-y-6">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Name</legend>
        <input type="text" class="input w-full" placeholder="Name" />
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Description</legend>
        <textarea class="textarea h-24 w-full" placeholder="Description"></textarea>
        <div class="label">Optional</div>
      </fieldset>
    </div>
  </div>

  <div class="mt-10 max-w-xl">
    <h2 class="text-xl font-semibold mb-4">Prices</h2>
    <div class="space-y-4 flex gap-2">
      {#if isFulltimeLoaded}
        <fieldset class="fieldset">
          <legend class="fieldset-legend">ull-time price ($)</legend>
          <div class="join">
            <div>
              <label class="input join-item">
                <span class="opacity-50 mt-px">$</span>
                <input type="number" placeholder="Price ($)" min="1" bind:value={fulltimeLicensePrice} />
              </label>
            </div>
          </div>
        </fieldset>
      {/if}

      {#if isOnetimeLoaded}
        <fieldset class="fieldset">
          <legend class="fieldset-legend">One-time price ($)</legend>
          <div class="join">
            <div>
              <label class="input join-item">
                <span class="opacity-50 mt-px">$</span>
                <input type="number" placeholder="Price ($)" min="1" bind:value={onetimeLicensePrice} />
              </label>
            </div>
          </div>
        </fieldset>
      {/if}
    </div>

    <div class="flex justify-end">
      <button class="btn btn-outline mt-6 w-[200px]" class:btn-disabled={!hasAnyChanges} onclick={handleSaveChanges} >
        {#if isOnetimeLicensePriceLoading || isFulltimeLicensePriceLoading}
          <span class="loading loading-spinner loading-sm"></span>
        {:else}
          Save changes
        {/if}
      </button>
    </div>
  </div>
</div>
