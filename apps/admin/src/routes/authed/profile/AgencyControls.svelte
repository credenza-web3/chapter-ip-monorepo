<script lang="ts">
  import AgencyAddressInput from '$lib/components/AgencyAddressInput.svelte'
  import { agencyStore } from '$lib/stores/agency.svelte.js'
  import { savePublisherAgencyAddress, savePublisherAgencyFee } from '$lib/services/agency'
  import AgencyFeeInput from '$lib/components/AgencyFeeInput.svelte'
  import type { ethers } from '@repo/fe-evm-provider'

  let { contentContract, userAddress }: { contentContract?: ethers.Contract; userAddress: string } = $props()
  let addressLoading = $state(false)
  let feeLoading = $state(false)

  async function saveAgencyAddress() {
    if (!contentContract) return
    addressLoading = true
    await savePublisherAgencyAddress(contentContract, userAddress)
    agencyStore.setOriginalAddress(agencyStore.agencyAddress)
    addressLoading = false
  }

  async function saveAgencyFee() {
    if (!contentContract) return
    feeLoading = true
    await savePublisherAgencyFee(contentContract, userAddress)
    agencyStore.setOriginalFee(agencyStore.agencyFee)
    feeLoading = false
  }
</script>

{#snippet actionButton(onclick: () => void, loading: boolean, disabled: boolean)}
  <button onclick={onclick} class="h-13 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed" disabled={loading || disabled}>
    {#if loading}
      <div class="loading loading-dots px-4"></div>
    {:else}
      Save
    {/if}
  </button>
{/snippet}

<div class="w-full">
  <h2 class="text-lg font-medium text-gray-900 mb-4">Agency Settings</h2>
  <div class="flex flex-col gap-2 mt-4 w-full">
    <div class="flex w-1/2 items-end gap-2">
      <AgencyAddressInput />
      {@render actionButton(saveAgencyAddress, addressLoading, !agencyStore.canSaveAddress)}
    </div>
    
    <div class="flex w-1/2 items-end gap-2">
      <AgencyFeeInput />
      {@render actionButton(saveAgencyFee, feeLoading, !agencyStore.canSaveFee)}
    </div>
  </div>
</div>
