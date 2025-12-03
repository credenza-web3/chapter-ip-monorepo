<script lang="ts">
  import { authStore } from '$lib'
  import { afterNavigate, beforeNavigate } from '$app/navigation'
  import { createClient } from '@repo/trpc/client'
  import { notify, ToastType } from '@repo/ui-components'
  import { mintWithPrices, uploadFileToBucket } from './helper'

  let isOver = $state(false)
  let loading = $state(false)
  let fileInput: HTMLInputElement | null = $state(null)
  let uploaded: File | null = $state(null)
  let isLifetimeLicense = $state(false)
  let isOneTimeLicense = $state(false)
  let lifetimePrice = $state(0)
  let oneTimePrice = $state(0)
  let isFormValid = $state(false)

  $effect(() => {
    if (!isLifetimeLicense) lifetimePrice = 0
    if (!isOneTimeLicense) oneTimePrice = 0
    isFormValid = (isLifetimeLicense && lifetimePrice > 0) || (isOneTimeLicense && oneTimePrice > 0)
  })

  function resetCheckboxes() {
    isLifetimeLicense = false
    isOneTimeLicense = false
    lifetimePrice = 0
    oneTimePrice = 0
  }

  beforeNavigate(() => {
    loading = true
  })

  afterNavigate(() => {
    loading = false
  })

  const maximumSize = 100 * 1024 * 1024 // 100MB

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    isOver = false
    handleInput(event)
  }

  function handleInput(event: Event) {
    const target = event?.target as HTMLInputElement
    const file = target?.files?.[0] || (event instanceof DragEvent ? event.dataTransfer?.files[0] : null)
    if (!file) return

    if (file.size > maximumSize) {
      alert('Selected file is too big. Maximum 100MB.')
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
      await trpcClient.files.registerContent.mutate({
        tokenId,
        key,
      })
      await trpcClient.files.uploadMetadata.mutate({
        tokenId,
        metadata: {
          name: uploaded.name,
          size: uploaded.size,
          type: uploaded.type,
          key,
        },
      })

      notify('File uploaded successfully', ToastType.SUCCESS)
      onClear()
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

<div class="p-4 min-h-xl">
  <div class="mb-12 text-center">
    <h1 class="text-4xl font-light text-gray-900">Upload File</h1>
  </div>
  {#if loading}
    <div class="flex items-center justify-center h-16">
      <span class="loading loading-dots loading-lg"></span>
    </div>
  {:else}
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-8 h-8 mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span class="text-center mb-2">Upload or drag a PDF file</span>
        <span class="text-xs text-stone-400">Max size: 100MB</span>
      {/if}

      <input type="file" class="hidden" bind:this={fileInput} onchange={handleInput} />
    </div>
    {#if uploaded}
      <div class="mt-6 space-y-4">
        <fieldset class="fieldset bg-base-100 rounded-box border p-4 max-w-lg">
          <legend class="fieldset-legend">Choose License Type</legend>
          <label class="label justify-between">
            <div class="space-x-2">
              <input type="checkbox" bind:checked={isLifetimeLicense} class="checkbox" />
              <span class="label-text">Lifetime License</span>
            </div>
            {#if isLifetimeLicense}
              <input
                type="number"
                class="input validator max-w-xs"
                required
                placeholder="Enter the price in dollars."
                min="1"
                bind:value={lifetimePrice}
              />
            {/if}
          </label>
          <label class="label justify-between">
            <div class="space-x-2">
              <input type="checkbox" bind:checked={isOneTimeLicense} class="checkbox" />
              <span class="label-text">One Time License</span>
            </div>

            {#if isOneTimeLicense}
              <input
                type="number"
                class="input validator max-w-xs"
                required
                placeholder="Enter the price in dollars."
                min="1"
                bind:value={oneTimePrice}
              />
            {/if}
          </label>
        </fieldset>

        <div class="flex gap-10 mt-3">
          <button class="btn btn-outline" onclick={onSubmitClick} disabled={loading} class:hidden={!isFormValid}
            >Upload</button
          >
        </div>
      </div>
    {/if}
  {/if}
</div>
