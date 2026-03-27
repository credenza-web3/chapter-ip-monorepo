<script lang="ts">
  import { goto } from '$app/navigation'
  import AgencyAddressInput from '$lib/components/AgencyAddressInput.svelte'
  import { agencyStore } from '$lib/stores/agency.svelte.js'
  import { savePublisherAgencyAddress, savePublisherAgencyFee } from '$lib/services/agency'
  import AgencyFeeInput from '$lib/components/AgencyFeeInput.svelte'
  import PublisherNameInput from '$lib/components/PublisherNameInput.svelte'
  import { savePublisher } from '$lib/services/publisher'
  import { onMount } from 'svelte'
  import { publisherStore } from '$lib/stores/publisher.svelte.js'
  import { uploadFileToBucket } from '../../upload/services/file-upload.service.js'

  let publisherName = $state('')
  let avatarUrl = $derived(publisherStore.avatarUrl || '')
  let loading = $state(false)
  let { data } = $props()
  let imageInput: HTMLInputElement | null = $state(null)
  let previewUrl = $state('')

  onMount(() => {
    if (publisherStore.title) {
      return goto('/authed/profile')
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
  }

  async function saveAgencyAddress() {
    if (!data.contentContract || !agencyStore.canSaveAddress) return
    await savePublisherAgencyAddress(data.contentContract, data.userAddress)
  }

  async function saveAgencyFee() {
    if (!data.contentContract || !agencyStore.canSaveFee) return
    await savePublisherAgencyFee(data.contentContract, data.userAddress)
  }

  async function handleSubmit() {
    try {
      loading = true

      let resolvedAvatarUrl = avatarUrl
      if (publisherStore.avatarFile) {
        const file = publisherStore.avatarFile
        const ext = file.name.split('.').pop() || ''

        const { url, key } = await data.trpcClient!.files.createUserFileUploadUrl.mutate({
          filename: 'avatar',
          mimetype: file.type,
          extension: ext,
          bucket: 'userfiles',
        })
        await uploadFileToBucket(file, url)

        resolvedAvatarUrl = `${import.meta.env.VITE_USERFILES_BUCKET_HOST}/${key}`
        publisherStore.clearAvatarFile()
      }

      const result = await savePublisher(data.trpcClient!, publisherName, resolvedAvatarUrl)

      if (!result.success) {
        return
      }

      await saveAgencyAddress()
      await saveAgencyFee()

      goto('/authed/upload')
    } finally {
      loading = false
    }
  }
</script>

<div class="min-h-xl flex items-center justify-center bg-white p-4">
  <div class="w-full max-w-md">
    <div class="mb-12 text-center">
      <h1 class="text-4xl font-light text-gray-900 mb-3">Create Publisher</h1>
      <p class="text-gray-500 text-sm">Set up your publisher account to continue</p>
    </div>

    <form onsubmit={handleSubmit} class="space-y-6">
      <PublisherNameInput bind:value={publisherName} />
      <div class="text-base font-semibold text-[#202225]">
        <span class="block mb-2.5">Profile image</span>
        {#if !!avatarUrl}
          <img src={avatarUrl} alt="avatar" class="w-25 h-25 object-contain" />
          <button
            id="image-select"
            class="text-[#6e4ff7] text-xs font-medium cursor-pointer"
            onclick={() => imageInput?.click()}
            type="button"
          >
            <span class="block mt-4">Upload profile image</span>
          </button>
        {:else}
          <div class="relative mt-2.5">
            <div
              class="w-25 h-25 rounded-full border-2 flex items-center justify-center bg-[#6e4ff7] text-white font-semibold text-[56px]"
            >
              {publisherName?.[0]?.toUpperCase() || 'U'}
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

      <div class="flex-1 max-w-md">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Agency Settings</h2>

        <div class="flex gap-2 mt-4">
          <AgencyAddressInput />

          <AgencyFeeInput />
        </div>
      </div>

      <button
        type="submit"
        disabled={!publisherName || loading}
        class="w-full py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
      >
        {#if loading}
          <div class="loading loading-dots"></div>
        {:else}
          Create
        {/if}
      </button>
    </form>
  </div>
</div>
<input type="file" class="hidden" bind:this={imageInput} onchange={handleImageInput} accept="image/*" />
