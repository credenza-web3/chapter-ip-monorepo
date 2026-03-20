<script lang="ts">
  import AgencyAddressInput from '$lib/components/AgencyAddressInput.svelte'
  import { agencyStore } from '$lib/stores/agency.svelte.js'
  import AgencyFeeInput from '$lib/components/AgencyFeeInput.svelte'

  let { hideSaveButtons = false } = $props<{
    contentContract?: any
    userAddress: string
    hideSaveButtons?: boolean
  }>()
</script>

<div class="max-w-2xl bg-[#f9fafb] p-6 rounded-lg border-[#dddddd] border">
  <h2 class="font-semibold mb-4">Agency</h2>
  <div class="flex flex-col gap-2 mt-8 w-full">
    <div class="flex items-end gap-2">
      <AgencyAddressInput />
      {#if !hideSaveButtons}
        <button
          class="h-13 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={!agencyStore.canSaveAddress}
        >
          Save
        </button>
      {/if}
    </div>

    <div class="flex items-end gap-2">
      <AgencyFeeInput />
      {#if !hideSaveButtons}
        <button
          class="h-13 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={!agencyStore.canSaveFee}
        >
          Save
        </button>
      {/if}
    </div>
  </div>
</div>
