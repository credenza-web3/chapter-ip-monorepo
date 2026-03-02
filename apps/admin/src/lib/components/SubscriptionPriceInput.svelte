<script lang="ts">
  import { notify, ToastType } from '@repo/ui-components'
  import { ethers, initProvider, getSigner } from '@repo/fe-evm-provider'
  import { abi as membership_abi } from '@credenza3/contracts/artifacts/ChapterIpMembershipContract.json'
  import { publisherStore } from '$lib/stores/publisher.svelte'
  import { onMount } from 'svelte'
  import { authStore } from '$lib/auth'
  import { forwardTransaction } from '@repo/fe-services'

  let value = $state(0)
  let loading = $state(false)

  function getMembershipContract(signer: any) {
    return new ethers.Contract(import.meta.env.VITE_EVM_MEMBERSHIP_CONTRACT_ADDRESS, membership_abi, signer)
  }

  async function handleInput(event: Event) {
    const target = event.target as HTMLInputElement
    const numValue = parseFloat(target.value)
    value = isNaN(numValue) ? 0 : numValue
  }

  async function getCurrentSubscriptionPrice() {
    try {
      const signer = await getSigner()
      const membershipContract = getMembershipContract(signer)

      const price: bigint = await membershipContract.getPriceFiat(BigInt(ethers.getAddress(publisherStore.evmAddress)))
      value = Number(price) / 100
    } catch (error) {
      console.error('Error getting current subscription price:', error)
      value = 0
    }
  }

  onMount(() => {
    getCurrentSubscriptionPrice()
  })

  async function setSubscriptionPrice() {
    if (value <= 0) {
      notify('Please enter a valid price', ToastType.WARN)
      return
    }

    try {
      loading = true
      const signer = await getSigner()
      const instance = getMembershipContract(signer)

      const tokenId = BigInt(ethers.getAddress(publisherStore.evmAddress))
      console.log(instance, tokenId)

      const setPriceFiatPopulatedTx = await instance.setPriceFiat.populateTransaction(tokenId, value * 100)

      const setPriceTokenFunction = instance.interface.getFunction('setPriceToken', ['uint', 'uint'])
      if (!setPriceTokenFunction) {
        throw new Error('setPriceToken function not found')
      }

      const setPriceTokenPopulatedTx = await instance[setPriceTokenFunction.format()].populateTransaction(
        tokenId,
        value * 10 ** 6,
      )

      const fwtOpts = {
        token: authStore.state.accessToken!,
        client_id: import.meta.env.VITE_CLIENT_ID,
        evm_wss: import.meta.env.VITE_CREDENZA_EVM_WSS,
      }

      await forwardTransaction(setPriceTokenPopulatedTx, fwtOpts)

      await forwardTransaction(setPriceFiatPopulatedTx, fwtOpts)

      notify('Subscription price updated successfully!', ToastType.SUCCESS)
    } catch (error) {
      console.error('Error setting subscription price:', error)
      notify('Error updating subscription price', ToastType.FAIL)
    } finally {
      loading = false
    }
  }
</script>

<div class="space-y-4">
  <div class="space-y-2">
    <label for="subscription-price" class="block text-sm font-medium text-gray-700"> Subscription Price ($) </label>
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span class="text-gray-500 sm:text-sm">$</span>
      </div>
      <input
        id="subscription-price"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        {value}
        oninput={handleInput}
        disabled={loading}
        class="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <span class="text-gray-500 sm:text-sm">USD</span>
      </div>
    </div>
  </div>

  <button
    type="button"
    onclick={setSubscriptionPrice}
    disabled={loading || value <= 0}
    class="w-full py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
  >
    {#if loading}
      <div class="flex items-center justify-center">
        <div class="loading loading-dots"></div>
      </div>
    {:else}
      Set Subscription Price
    {/if}
  </button>
</div>
