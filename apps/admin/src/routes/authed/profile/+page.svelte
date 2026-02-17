<script lang="ts">
  import AgencyAddressInput from '$lib/components/AgencyAddressInput.svelte'
  import type { AgencyAddressInputRef } from '$lib/types/components'
  import NavigationBar from './components/NavigationBar.svelte'
  import { HistoryTabs } from './types'
  let { data } = $props()
  let agencyInputRef: AgencyAddressInputRef
  let activeTab = $state<HistoryTabs>(HistoryTabs.CRED_BALANCE)

  function saveAgency() {
    if (agencyInputRef) {
      agencyInputRef.saveData()
    }
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
      <div class="flex-1 max-w-md relative opacity-50 pointer-events-none">
        <!-- TODO: implement agency settings and remove cover -->
        <div class="absolute inset-0 bg-gray-200 opacity-10 rounded-lg z-10 flex items-center justify-center"></div>
        <h2 class="text-lg font-medium text-gray-900 mb-4">Agency Settings (in development)</h2>
        <AgencyAddressInput bind:this={agencyInputRef} />
        <button onclick={saveAgency} class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Save Agency
        </button>
      </div>
      <hr />
      <!-- TODO: implement transactions history and remove cover -->
      <NavigationBar bind:activeTab />
      <div class="flex-1 max-w-md">
        <h2 class="text-lg font-medium text-gray-200 mb-4">Your transactions history (in development)</h2>
        <div class="bg-gray-200 opacity-10 p-4 rounded-lg mb-6">
          <p class="text-sm text-gray-600 mb-1">TBD</p>
        </div>
      </div>
    </div>
  </div>
</div>
