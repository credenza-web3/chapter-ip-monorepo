<script lang="ts">
  import AgencyControls from './AgencyControls.svelte'
  import NavigationBar from './components/NavigationBar.svelte'
  import CredContractHistory from './components/CredContractHistory.svelte'
  import ContentNftHistory from './components/ContentNftHistory.svelte'
  import LicenseNftHistory from './components/LicenseNftHistory.svelte'
  import { HistoryTabs } from './types'

  let { data } = $props()
  
  let activeTab = $state(HistoryTabs.CRED_BALANCE)
</script>

<div class="min-h-xl flex items-center justify-center bg-white p-4 w-full">
  <div class="w-full">
    <div class="mb-12 text-center">
      <h1 class="text-4xl font-light text-gray-900 mb-3">Profile</h1>
      <p class="text-gray-500 text-sm">Manage your profile settings</p>
    </div>

    <div class="flex flex-col gap-6 w-full justify-between">
      <div class="max-w-md">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Your Information</h2>

        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <p class="text-sm text-gray-600 mb-1">Your Address</p>
          <p class="text-sm font-mono text-gray-900 break-all">{data.userAddress}</p>
        </div>
      </div>
      <hr />
      <AgencyControls contentContract={data.contentContract} userAddress={data.userAddress as string} />
      <hr />
      <NavigationBar bind:activeTab />
      <h2 class="text-lg font-medium mb-4">Your transactions history</h2>
      <div class="flex-1 max-w-2xl">
        {#if activeTab === HistoryTabs.CRED_BALANCE}
          <CredContractHistory userAddress={data.userAddress} />
        {:else if activeTab === HistoryTabs.CONTENT_NFT}
          <ContentNftHistory userAddress={data.userAddress} />
        {:else if activeTab === HistoryTabs.LICENSES_NFT}
          <LicenseNftHistory userAddress={data.userAddress} />
        {/if}
      </div>
    </div>
  </div>
</div>
