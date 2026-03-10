<script lang="ts">
  import AgencyControls from './components/AgencyControls.svelte'
  import SubscriptionPriceInput from '$lib/components/SubscriptionPriceInput.svelte'
  import EditPublisher from './components/EditPublisher.svelte'
  import { useProfileSave } from '$lib/hooks/useProfileSave.svelte'
  import { useClipboard } from '$lib/hooks/useClipboard.svelte'
  import blockIcon from '$lib/assets/block.svg'
  import CopyIcon from '$lib/components/icons/CopyIcon.svelte'

  let { data } = $props()

  let profileSave = $state(useProfileSave(data.trpcClient, data.contentContract!, data.userAddress as string))
  const { copyToClipboard } = useClipboard()

  $effect(() => {
    if (data.trpcClient && data.contentContract && data.userAddress) {
      profileSave = useProfileSave(data.trpcClient, data.contentContract, data.userAddress as string)
    }
  })
</script>

<div class="min-h-xl flex items-center justify-center bg-white p-[40px] w-full">
  <div class="w-full">
    <div class="mb-12 text-left">
      <h1 class="text-2xl font-semibold">Profile</h1>
    </div>

    <div class="flex flex-col gap-6 w-full justify-between">
      <div class="max-w-1/2 gap-2 bg-[#f9fafb] p-6 rounded-lg border-[#dddddd] border">
        <h2 class="font-semibold mb-4">Your blockchain address</h2>
        <div
          class="flex justify-between items-center text-sm font-mono bg-white p-2 rounded break-all border-2 border-[#e5e5e5]"
        >
          <div>
            <img src={blockIcon} alt="block" class="w-8 h-8 inline-block" />
            {data.userAddress}
          </div>

          <button
            onclick={() => copyToClipboard(data.userAddress!, 'Address copied to clipboard')}
            class="w-8 h-8 inline-block ml-2 cursor-pointer hover:opacity-70 border-0 bg-transparent p-0"
            title="Copy address"
          >
            <CopyIcon />
          </button>
        </div>
      </div>

      <div class="flex flex-col items-end gap-2 w-1/2 mt-10">
        <EditPublisher onUpdate={profileSave.updatePublisherData} />
        <SubscriptionPriceInput onUpdate={profileSave.updateSubscriptionPrice} hideSaveButton={true} />
      </div>

      <AgencyControls
        contentContract={data.contentContract}
        userAddress={data.userAddress as string}
        hideSaveButtons={true}
      />

      <div class="flex justify-start py-6">
        <button
          class="btn btn-outline w-[220px] text-white bg-[#6e4ff7] disabled:bg-[#f9fafb] disabled:text-black/10 disabled:border-[#6e4ff7]/20"
          onclick={profileSave.handleSaveAll}
          disabled={!profileSave.hasChanges || profileSave.loading}
        >
          {#if profileSave.loading}
            <div class="flex items-center gap-2">
              <div class="loading loading-dots"></div>
              Saving...
            </div>
          {:else}
            Save All Changes
          {/if}
        </button>
      </div>
    </div>
  </div>
</div>
