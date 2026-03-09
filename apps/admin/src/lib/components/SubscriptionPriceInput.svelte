<script lang="ts">
  import { ethers, getSigner } from '@repo/fe-evm-provider'
  import { abi as membership_abi } from '@credenza3/contracts/artifacts/ChapterIpMembershipContract.json'
  import { publisherStore } from '$lib/stores/publisher.svelte'
  import { onMount } from 'svelte'

  let { onUpdate, hideSaveButton = false } = $props<{
    onUpdate?: (price: number) => void
    hideSaveButton?: boolean
  }>()

  let value = $state(0)

  function getMembershipContract(signer: any) {
    return new ethers.Contract(import.meta.env.VITE_EVM_MEMBERSHIP_CONTRACT_ADDRESS, membership_abi, signer)
  }

  async function handleInput(event: Event) {
    const target = event.target as HTMLInputElement
    const numValue = parseFloat(target.value)
    value = isNaN(numValue) ? 0 : numValue
    
    // Notify parent of changes
    if (onUpdate) {
      onUpdate(value)
    }
  }

  async function getCurrentSubscriptionPrice() {
    try {
      const signer = await getSigner()
      const membershipContract = getMembershipContract(signer)

      const price: bigint = await membershipContract.getPriceFiat(BigInt(ethers.getAddress(publisherStore.evmAddress)))
      value = Number(price) / 100
      
      // Notify parent of initial value
      if (onUpdate) {
        onUpdate(value)
      }
    } catch (error) {
      console.error('Error getting current subscription price:', error)
      value = 0
    }
  }

  onMount(() => {
    getCurrentSubscriptionPrice()
  })
</script>

<div class="flex flex-col w-full">
  <div class="flex flex-col items-start w-full">
    <label for="subscription-price" class="block text-sm font-medium text-gray-700"> Subscription Price ($) </label>
    <div class="relative w-full">
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
        class="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm"
      />
      <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <span class="text-gray-500 sm:text-sm">USD</span>
      </div>
    </div>
  </div>

  {#if !hideSaveButton}
    <button
      type="button"
      disabled={value <= 0}
      class="w-full py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
    >
      Set Subscription Price
    </button>
  {/if}
</div>
