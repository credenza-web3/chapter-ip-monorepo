<script lang="ts">
  import { publisherStore } from '$lib/stores/publisher.svelte'
  import AgencyControls from './components/AgencyControls.svelte'
  import SubscriptionPriceInput from '$lib/components/SubscriptionPriceInput.svelte'
  import EditPublisher from './components/EditPublisher.svelte'
  import { useProfileSave } from '$lib/hooks/useProfileSave.svelte'
  import { useClipboard } from '$lib/hooks/useClipboard.svelte'
  import blockIcon from '$lib/assets/block.svg'
  import CopyIcon from '$lib/components/icons/CopyIcon.svelte'

  let { data } = $props()
  let avatarUrl = $derived(publisherStore.avatarUrl || '')

  let profileSave = $state(useProfileSave(data.trpcClient, data.contentContract!, data.userAddress as string))
  const { copyToClipboard } = useClipboard()

  $effect(() => {
    if (data.trpcClient && data.contentContract && data.userAddress) {
      profileSave = useProfileSave(data.trpcClient, data.contentContract, data.userAddress as string)
    }
  })
</script>

<div class="min-h-xl flex items-center justify-center bg-white md:p-10 p-5 w-full">
  <div class="w-full">
    <div class="mb-12 text-left">
      <h1 class="text-2xl font-semibold">Profile</h1>
    </div>

    <div class="flex flex-col gap-6 w-full justify-between">
      <div class="max-w-2xl gap-2 bg-[#f9fafb] p-6 rounded-lg border-[#dddddd] border">
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
      <div class="text-base font-semibold text-[#202225] mt-12.5">
        <span>Profile image</span>
        {#if !!avatarUrl}
          <img src={avatarUrl} alt="avatar" class="w-25 h-25 object-cover mt-2.5 rounded-[50px] border-2" />
        {:else}
          <div
            class="w-25 h-25 mt-2.5 rounded-[50px] border-2 flex items-center justify-center bg-[#6e4ff7] text-white font-semibold text-[56px]"
          >
            {publisherStore.title?.[0]?.toUpperCase() || 'U'}
          </div>
        {/if}
      </div>
      <div class="flex flex-col items-end gap-2 max-w-2xl mt-6.25">
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
          class="btn btn-outline w-55 text-white bg-[#6e4ff7] disabled:bg-[#f9fafb] disabled:text-black/10 disabled:border-[#6e4ff7]/20"
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
