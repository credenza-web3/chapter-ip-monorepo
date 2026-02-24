<script lang="ts">
  import AgencyControls from './AgencyControls.svelte'
  import NavigationBar from './components/NavigationBar.svelte'
  import CredContractHistory from './components/CredContractHistory.svelte'
  import ContentNftHistory from './components/ContentNftHistory.svelte'
  import LicenseNftHistory from './components/LicenseNftHistory.svelte'
  import { HistoryTabs } from './types'
  import { modals } from 'svelte-modals'
  import EditPublisherModal from './EditPublisherModal.svelte'
  import { publisherStore } from '$lib/stores/publisher.svelte'

  let { data } = $props()
  
  let activeTab = $state(HistoryTabs.CRED_BALANCE)

  function openEditModal() {
    modals.open(EditPublisherModal, {
      trpcClient: data.trpcClient
    })
  }
</script>

<div class="min-h-xl flex items-center justify-center bg-white p-4 w-full">
  <div class="w-full">
    <div class="mb-12 text-center">
      <h1 class="text-4xl font-light text-gray-900 mb-3">Profile</h1>
      <p class="text-gray-500 text-sm">Manage your profile settings</p>
    </div>

    <div class="flex flex-col gap-6 w-full justify-between">
      <div class="max-w-md gap-2">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Your Information</h2>

        <div class="bg-gray-50 p-4 rounded-lg">
         
          <p class="text-sm text-gray-600 mb-1">Your Address</p>
          <p class="text-sm font-mono text-gray-900 break-all">{data.userAddress}</p>
          <hr />
          <div class="flex items-end gap-2 my-3">
            {#if publisherStore?.avatarUrl}
            <div class="flex items-center gap-2">
              <img src={publisherStore?.avatarUrl} alt="" class="w-24 h-24 rounded-full" />
            </div>
            {/if}
            {#if publisherStore?.title}
             <p class="text-sm font-mono text-gray-900 break-all">Publisher title: {publisherStore?.title}</p>
            {/if}
            {#if publisherStore}
              <button
                onclick={openEditModal}
                class="ml-auto px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
            {/if}
          </div>
        </div>
      </div>
      <hr />
      <AgencyControls contentContract={data.contentContract} userAddress={data.userAddress as string} />
      <hr />
      <NavigationBar bind:activeTab />
      <h2 class="text-lg font-medium mb-4">Your transactions history</h2>
      <div class="flex-1 max-w-2xl">
        {#if activeTab === HistoryTabs.CRED_BALANCE}
          <CredContractHistory userAddress={data.userAddress}/>
        {:else if activeTab === HistoryTabs.CONTENT_NFT}
          <ContentNftHistory userAddress={data.userAddress} {activeTab} />
        {:else if activeTab === HistoryTabs.LICENSES_NFT}
          <LicenseNftHistory userAddress={data.userAddress} {activeTab} />
        {/if}
      </div>
    </div>
  </div>
</div>
