<script lang="ts">
  import { authStore } from '$lib/auth/index.js'
  import { formatDate } from '$lib/services/formatDate.js'
  import { ethers, initProvider } from '@repo/fe-evm-provider'
  import { onMount } from 'svelte'
  import { abi as content_abi } from '@credenza3/contracts/artifacts/ContentNftContract.json'
  import { forwardTransaction } from '@repo/fe-services'

  let { data } = $props()
  const { items } = data.paginatedResponse

  let contentContract: any = $state(null)
  let fulltimeLicensePrice = $state(0)
  let onetimeLicensePrice = $state(0)

  let isFulltimeLicensePriceLoading = $state(false)
  let isOnetimeLicensePriceLoading = $state(false)
  

  const handleUpdateFulltimeLicensePrice = async () => {
    isFulltimeLicensePriceLoading = true

    try {
      const provider = await initProvider(authStore.state.accessToken!)
      const ethersProvider = new ethers.BrowserProvider(provider)
      const tokenId = Number(items[0].tokenId)

      const sendTx = async (populatedTx: any) => {
        const txHash = await forwardTransaction(populatedTx, {
          token: authStore.state.accessToken!,
          client_id: import.meta.env.VITE_CLIENT_ID,
          evm_wss: import.meta.env.VITE_CREDENZA_EVM_WSS,
        })
        const receipt = await ethersProvider.waitForTransaction(txHash)
        if (!receipt) throw new Error('Transaction failed')
        return receipt
      }
      await sendTx(
        await contentContract.setLicensePriceFiat.populateTransaction(tokenId, '0', fulltimeLicensePrice * 100),
      )
      await sendTx(await contentContract.setLicensePriceToken.populateTransaction(tokenId, '0', fulltimeLicensePrice))
    } catch (error) {
      console.error(error)
    } finally {
      isFulltimeLicensePriceLoading = false
    }
  }

  const handleUpdateOnetimeLicensePrice = async () => {
    isOnetimeLicensePriceLoading = true

    try {
      const provider = await initProvider(authStore.state.accessToken!)
      const ethersProvider = new ethers.BrowserProvider(provider)
      const tokenId = Number(items[0].tokenId)

      const sendTx = async (populatedTx: any) => {
        const txHash = await forwardTransaction(populatedTx, {
          token: authStore.state.accessToken!,
          client_id: import.meta.env.VITE_CLIENT_ID,
          evm_wss: import.meta.env.VITE_CREDENZA_EVM_WSS,
        })
        const receipt = await ethersProvider.waitForTransaction(txHash)
        if (!receipt) throw new Error('Transaction failed')
        return receipt
      }
      await sendTx(
        await contentContract.setLicensePriceFiat.populateTransaction(tokenId, '2', onetimeLicensePrice * 100),
      )
      await sendTx(await contentContract.setLicensePriceToken.populateTransaction(tokenId, '2', onetimeLicensePrice))
    } catch (error) {
      console.error(error)
    } finally {
      isOnetimeLicensePriceLoading = false
    }
  }

  onMount(async () => {
    const tokenId = data.paginatedResponse.items[0].tokenId
    const provider = await initProvider(authStore.state.accessToken!)
    const ethersProvider = new ethers.BrowserProvider(provider)
    const signer = await ethersProvider.getSigner()

    contentContract = new ethers.Contract(import.meta.env.VITE_EVM_CONTENT_NFT_CONTRACT_ADDRESS, content_abi, signer)

    fulltimeLicensePrice = Number(await contentContract.getLicensePriceFiat(tokenId, '0')) / 100
    onetimeLicensePrice = Number(await contentContract.getLicensePriceFiat(tokenId, '2')) / 100
    console.log(fulltimeLicensePrice, onetimeLicensePrice)
  })
</script>

<div class="card bg-base-100 shadow-md p-6">
  <div class="mb-12 text-center">
    <h1 class="text-4xl font-light text-gray-900">File Details</h1>
  </div>
  <div class="flex flex-col md:flex-row justify-between gap-6 md:px-7">
    {#if items.length > 0}
      {#each items as item}
        <ul class="basis-1/2">
          <li><strong>ID:</strong> {item.id}</li>
          <li><strong>Sub:</strong> {item.sub}</li>
          <li><strong>Bucket:</strong> {item.bucket}</li>
          <li><strong>Key:</strong> {item.key}</li>
          <li><strong>Token ID:</strong> {item.tokenId}</li>
          <li><strong>Created:</strong> {formatDate(item.createdAt)}</li>
          <li><strong>Updated:</strong> {formatDate(item.updatedAt)}</li>
        </ul>
      {/each}
    {/if}
    <div class="basis-1/2">
      <h2 class="text-xl font-semibold mb-2">Prices</h2>

      <div class="space-y-3">
        {#if fulltimeLicensePrice}
          <div class="flex items-end gap-2">
            <label class="flex-col" for="fulltime">
              <span class="label-text">Full time pice ($)</span>
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
        {#if onetimeLicensePrice}
          <div class="flex items-end gap-2">
            <label class="flex-col" for="onetime">
              <span>One time pice ($)</span>
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
