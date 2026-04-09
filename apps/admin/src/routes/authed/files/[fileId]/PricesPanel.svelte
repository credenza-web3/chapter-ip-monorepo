<script lang="ts">
  import { notify, ToastType } from '@repo/ui-components'
  import { sendTx } from '$lib/services/transaction'
  import { ethers } from '@repo/fe-evm-provider'

  type Props = {
    tokenId: string
    contentContract: ethers.Contract | undefined
    fulltimeLicensePrice: number
    onetimeLicensePrice: number
    isFulltimeLoaded: boolean
    isOnetimeLoaded: boolean
  }

  let {
    tokenId,
    contentContract,
    fulltimeLicensePrice = $bindable(),
    onetimeLicensePrice = $bindable(),
    isFulltimeLoaded,
    isOnetimeLoaded,
  }: Props = $props()

  let isFulltimeLicensePriceLoading = $state(false)
  let isOnetimeLicensePriceLoading = $state(false)

  const handleUpdateFulltimeLicensePrice = async () => {
    isFulltimeLicensePriceLoading = true
    try {
      const fiatTx = await contentContract?.setLicensePriceFiat?.populateTransaction(
        tokenId,
        '0',
        fulltimeLicensePrice * 100,
      )
      if (fiatTx) await sendTx(fiatTx)
      const tokenTx = await contentContract?.setLicensePriceToken?.populateTransaction(
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
      const fiatTx = await contentContract?.setLicensePriceFiat?.populateTransaction(
        tokenId,
        '2',
        onetimeLicensePrice * 100,
      )
      if (fiatTx) await sendTx(fiatTx)
      const tokenTx = await contentContract?.setLicensePriceToken?.populateTransaction(
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
</script>

<div class="basis-1/2 p-4 bg-white rounded-lg border border-[#e5e5e5] shadow-sm max-w-120">
  <h2 class="font-semibold mb-4 text-lg text-gray-800">Prices</h2>

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
            oninput={handlePriceChange((v) => (fulltimeLicensePrice = v))}
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
            oninput={handlePriceChange((v) => (onetimeLicensePrice = v))}
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
