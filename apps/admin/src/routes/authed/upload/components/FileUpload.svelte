<script lang="ts">
  import { uploadStore } from '../stores/upload-store'
  import UploadIcon from '$lib/components/icons/UploadIcon.svelte'

  let isOver = $state(false)
  let fileInput: HTMLInputElement | null = $state(null)

  const maximumSize = 1 * 1024 * 1024 * 1024 // 1GB

  const allowedExtensions = ['.mp4', '.mov', '.txt', '.docx', '.zip']

  function getFileExtension(filename: string): string {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase()
  }

  function isValidFileType(filename: string): boolean {
    const ext = getFileExtension(filename)
    return allowedExtensions.includes('.' + ext)
  }

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
      alert('Selected file is too big. Maximum size is 1GB.')
      if (target) target.value = ''
      return
    }

    if (!isValidFileType(file.name)) {
      alert('Invalid file type. Allowed types: MP4, MOV, TXT, DOCX, ZIP.')
      if (target) target.value = ''
      return
    }

    uploadStore.setUploaded(file)
  }

  // function onClear() {
  //   uploadStore.reset()
  //   if (fileInput) fileInput.value = ''
  // }
</script>

<div
  class={`max-w-2xl mt-10 bg-white h-50 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-500 text-sm cursor-pointer transition ${
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
  <div class="mb-2">
    <UploadIcon />
  </div>
  <span class="text-center mb-2 font-medium text-sm">Upload or drag a file</span>
  {#if $uploadStore.uploaded}
    <div class="flex flex-col items-center mt-4">
      <span class="mb-2">📄 {$uploadStore.uploaded.name}</span>
    </div>
  {:else}
    <button class="btn bg-[#6e4ff7] text-white px-2 w-50 mb-2"> Add file </button>
    <span class="text-xs text-[#707070] font-medium">Max. file size: 1gb | File types supported: .txt, .docx, .mov, .mp4, .nil, and .zip</span>
  {/if}

  <input type="file" class="hidden" bind:this={fileInput} onchange={handleInput} accept=".mp4,.mov,.txt,.docx,.zip" />
</div>
