<script lang="ts">
  import Base from '../../../../../packages/ui/components/modals/Base.svelte'
  import UploadIcon from '$lib/assets/upload-icon.svg'
  import { notify, ToastType } from '@repo/ui-components'
  import { createClient } from '@repo/trpc/client'
  import { mintWithPrices, uploadFileToBucket } from '$lib/services/helper'
  import { authStore } from '$lib/auth'
  import { closeModal } from 'svelte-modals/legacy'
  import { invalidate } from '$app/navigation'

  let { onClose, data } = $props()
  let isOver = $state(false)
  const maximumSize = 1 * 1024 * 1024 * 1024 // 1GB
  let uploaded: File | null = $state(null)
  let isLifetimeLicense = $state(false)
  let isOneTimeLicense = $state(false)
  let lifetimePrice = $state(0)
  let oneTimePrice = $state(0)
  let fileInput: HTMLInputElement | null = $state(null)
  let isFormValid = $state(false)
  let loading = $state(false)

  $effect(() => {
    if (!isLifetimeLicense) lifetimePrice = 0
    if (!isOneTimeLicense) oneTimePrice = 0
    isFormValid = (isLifetimeLicense && lifetimePrice > 0) || (isOneTimeLicense && oneTimePrice > 0)
  })

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    isOver = false
    handleInput(event)
  }

  function resetCheckboxes() {
    isLifetimeLicense = false
    isOneTimeLicense = false
    lifetimePrice = 0
    oneTimePrice = 0
  }

  function handleInput(event: Event) {
    const target = event?.target as HTMLInputElement
    const file = target?.files?.[0] || (event instanceof DragEvent ? event.dataTransfer?.files[0] : null)
    if (!file) return

    if (file.size > maximumSize) {
      alert('Selected file is too big. Maximum size is 1GB.')
      if (target) target.value = ''
      return
    }

    uploaded = file
    resetCheckboxes()
  }

  const onClear = () => {
    uploaded = null
    resetCheckboxes()
    if (fileInput) fileInput.value = ''
  }

  const onSubmitClick = async () => {
    if (!uploaded) {
      notify('No file selected', ToastType.FAIL)
      return
    }

    try {
      loading = true
      const trpcClient = createClient({
        trpcUrl: import.meta.env.VITE_TRPC_URL || 'http://localhost:8060/trpc',
        getAccessTokenFn: () => authStore.state.accessToken!,
      })

      const tokenId = await mintWithPrices(authStore.state.accessToken!, lifetimePrice, oneTimePrice)
      const { url, key } = await trpcClient.files.createContentUploadUrl.mutate({
        tokenId,
        mimetype: uploaded.type,
      })
      await uploadFileToBucket(uploaded, url)
      await data.trpcClient!.files.registerContent.mutate({
        tokenId,
        key,
      })
      await data.trpcClient!.files.uploadMetadata.mutate({
        tokenId,
        metadata: {
          name: uploaded.name,
          size: uploaded.size,
          type: uploaded.type,
          key,
          image: 'https://pub-1a5fde2f5a814d7bbcaca6562a705028.r2.dev/chapter_ip.png',
        },
      })

      notify('File uploaded successfully', ToastType.SUCCESS)
      onClear()
      await invalidate('app:files')
      closeModal()
    } catch (error) {
      console.error('Error uploading file:', error)
      let errorMessage = 'Failed to upload file.'
      if (error instanceof Error && error.message.includes('duplicate key error')) {
        errorMessage = errorMessage + ' This file already exists.'
      }
      notify(errorMessage, ToastType.FAIL)
    } finally {
      loading = false
    }
  }
</script>

<Base {onClose}>
  <div class="flex-1 overflow-y-auto p-6 space-y-6">
    <h2 class="text-xl font-semibold">File upload</h2>

    <div class="flex flex-col items-center gap-2">
      <div
        class="w-28 h-28 border-2 border-dashed
                   rounded-lg flex items-center justify-center
                   text-sm text-gray-400"
      ></div>
      Add profile image
    </div>
    <h2>Choose license type and pricing</h2>

    <input type="text" placeholder="Name" class="input input-bordered w-full" />
    <textarea class="textarea w-full" placeholder="Bio"></textarea>

    <h2>Add file</h2>

    <div
      class={`mt-10 bg-white h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-500 text-sm cursor-pointer transition ${
        isOver ? 'border-primary bg-white' : 'border-gray-300'
      }`}
      role="button"
      tabindex="0"
      aria-label="Upload or drag a file"
      ondragover={(e) => {
        e.preventDefault()
        isOver = true
      }}
      ondragleave={() => (isOver = false)}
      ondrop={handleDrop}
      onclick={() => fileInput?.click()}
      onkeydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') fileInput?.click()
      }}
    >
      {#if uploaded}
        <div class="flex flex-col items-center">
          <span class="mb-2">📄 {uploaded.name}</span>
          <button onclick={onClear} class="btn btn-xs btn-outline" type="button">Clear</button>
        </div>
      {:else}
        <img src={UploadIcon} alt="" class="w-full size-10" />
        <span class="text-center mb-2">Upload or drag a file</span>
        <span class="text-xs text-stone-400">All file types supported — Max size: 1GB</span>
      {/if}

      <input type="file" class="hidden" bind:this={fileInput} onchange={handleInput} />
    </div>
    {#if uploaded}
      <h2>Choose pricing</h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2">
            <input type="checkbox" bind:checked={isLifetimeLicense} class="toggle" />
            <span>Lifetime license (USD)</span>
          </label>
          {#if isLifetimeLicense}
            <input
              type="number"
              class="input input-bordered w-24"
              required
              placeholder="USD"
              min="1"
              bind:value={lifetimePrice}
            />
          {/if}
        </div>

        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2">
            <input type="checkbox" bind:checked={isOneTimeLicense} class="toggle" />
            <span>One-time license (USD)</span>
          </label>
          {#if isOneTimeLicense}
            <input
              type="number"
              class="input input-bordered w-24"
              required
              placeholder="USD"
              min="1"
              bind:value={oneTimePrice}
            />
          {/if}
        </div>
      </div>
    {/if}
  </div>
  <button class="btn btn-primary mt-6 w-full" onclick={onSubmitClick} disabled={loading} class:hidden={!isFormValid}
    >Upload</button
  >
</Base>
