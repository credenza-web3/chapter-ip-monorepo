<script lang="ts">
  import { afterNavigate, beforeNavigate } from '$app/navigation'
  import { ToastType } from '$lib/common'
  import notify from '$lib/toast'

  let isOver = $state(false)
  let loading = $state(false)
  let fileInput: HTMLInputElement | null = $state(null)
  let uploaded: File | null = $state(null)

  beforeNavigate(() => {
    loading = true
  })

  afterNavigate(() => {
    loading = false
  })

  const maximumSize = 100 * 1024 * 1024 // 5MB

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    isOver = false
    handleInput(event)
  }

  function handleInput(event: Event) {
    const target = event?.target as HTMLInputElement
    const file = target?.files?.[0] || (event instanceof DragEvent ? event.dataTransfer?.files[0] : null)
    if (!file) return

    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed.')
      if (target) target.value = ''
      return
    }

    if (file.size > maximumSize) {
      alert('Selected file is too big. Maximum 100MB.')
      if (target) target.value = ''
      return
    }

    uploaded = file
  }

  const onClear = () => {
    uploaded = null
    if (fileInput) fileInput.value = ''
  }
  const onSubmitClick = async () => {
    if (!uploaded) {
      notify('No file selected', ToastType.FAIL)
      return
    }

    try {
      loading = true
      const arrayBuffer = await uploaded?.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
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

  let prevHash = $state('')
</script>

<div class="mx-10">
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
      aria-label="Upload or drag a PDF file"
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

      <input type="file" accept="application/pdf" class="hidden" bind:this={fileInput} onchange={handleInput} />
    </div>
    {#if uploaded}
      <div class="grid md:grid-cols-2 gap-6 mt-6">
        <div>
          <input
            class="input input-bordered w-full"
            type="text"
            bind:value={prevHash}
            placeholder="Previous Hash (optional)"
          />
        </div>
      </div>

      <div class="flex gap-10 mt-3">
        <button class="btn btn-outline" onclick={onSubmitClick} disabled={loading}>Upload</button>
      </div>
    {/if}
  {/if}
</div>
