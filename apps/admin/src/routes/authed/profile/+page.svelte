<script lang="ts">
  import AgencyAddressInput from '$lib/components/AgencyAddressInput.svelte'
  import { agencyStore } from '$lib/stores/agency.svelte.js'
  import { savePublisherAgency } from '$lib/services/agency'

  let { data } = $props()
  let loading = $state(false)

  async function saveAgency() {
    if (!data.contentContract) return
    loading = true
    await savePublisherAgency(data.contentContract, data.userAddress, agencyStore.agencyAddress)
    loading = false
  }
</script>

<div class="min-h-xl flex items-center justify-center bg-white p-4 w-full">
  <div class="w-full">
    <div class="mb-12 text-center">
      <h1 class="text-4xl font-light text-gray-900 mb-3">Profile</h1>
      <p class="text-gray-500 text-sm">Manage your profile settings</p>
    </div>

    <div class="flex flex-col gap-6 w-full justify-between">
      <div class="flex-1 max-w-md">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Your Information</h2>
        
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <p class="text-sm text-gray-600 mb-1">Your Address</p>
          <p class="text-sm font-mono text-gray-900 break-all">{data.userAddress}</p>
        </div>
      </div>
      <hr />
      <div class="flex-1 max-w-md">

        <h2 class="text-lg font-medium text-gray-900 mb-4">Agency Settings</h2>
        <AgencyAddressInput/>
        <button onclick={saveAgency} class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed" disabled={loading || !agencyStore.canSave}>
          {loading ? 'Saving...' : 'Save Agency'}
        </button>
      </div>
      <hr />
      <div class="flex-1 max-w-md">
         <!-- TODO: implement transactions history and remove cover -->
        <h2 class="text-lg font-medium text-gray-200 mb-4">Your transactions history (in development)</h2>
        
        <div class="bg-gray-200 opacity-10 p-4 rounded-lg mb-6">
          <p class="text-sm text-gray-600 mb-1">TBD</p>
        </div>
      </div>
    </div>
  </div>
</div>
