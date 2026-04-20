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
  let imageInput: HTMLInputElement | null = $state(null)

  let profileSave = $state(useProfileSave(data.trpcClient, data.contentContract!, data.userAddress as string))
  const { copyToClipboard } = useClipboard()

  $effect(() => {
    if (data.trpcClient && data.contentContract && data.userAddress) {
      profileSave = useProfileSave(data.trpcClient, data.contentContract, data.userAddress as string)
    }
  })

  function handleImageInput(event: Event) {
    const target = event?.target as HTMLInputElement
    const file = target?.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      if (target) target.value = ''
      return
    }
    publisherStore.setAvatarFile(file)
    profileSave.updatePublisherData(publisherStore.title, publisherStore.avatarUrl)
  }
</script>

<div class="min-h-xl flex items-center justify-center bg-white md:p-10 p-5 w-full">
  <div class="w-full">
    <div class="mb-8.25 text-left">
      <h1 class="text-[22px] text-dark font-semibold">Profile</h1>
    </div>

    <div class="flex flex-col gap-6 w-full justify-between">
      <div class="max-w-2xl gap-2 bg-cream p-6 rounded-lg border-[#dddddd] border">
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
      <div class="text-base font-semibold text-dark mt-12.5">
        <span class="block mb-2.5">Profile image</span>
        {#if !!avatarUrl}
          <img src={avatarUrl} alt="avatar" class="w-25 h-25 object-contain" />
          <button
            id="image-select"
            class="text-primary text-xs font-medium cursor-pointer"
            onclick={() => imageInput?.click()}
            type="button"
          >
            <span class="block mt-4">Upload profile image</span>
          </button>
        {:else}
          <div class="relative mt-2.5">
            <div
              class="w-25 h-25 rounded-full border-2 flex items-center justify-center bg-primary text-white font-semibold text-[56px]"
            >
              {publisherStore.title?.[0]?.toUpperCase() || 'U'}
            </div>
            <button
              id="image-select"
              type="button"
              onclick={() => imageInput?.click()}
              class="absolute left-16.75 -bottom-2.5 size-10 rounded-full bg-[#e5e5e5] text-[#8a8a8a] text-xl font-semibold
              flex items-center justify-center cursor-pointer border-4 border-white"
            >
              <span class="mb-0.75"> + </span>
            </button>
          </div>
        {/if}
      </div>
      <div class="flex flex-col items-end gap-2 max-w-2xl">
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
          class="btn btn-outline w-55 text-white bg-primary disabled:bg-cream disabled:text-black/10 disabled:border-primary/20"
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
<input type="file" class="hidden" bind:this={imageInput} onchange={handleImageInput} accept="image/*" />
