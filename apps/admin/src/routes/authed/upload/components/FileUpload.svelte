<script lang="ts">
  import { uploadStore } from '../stores/upload-store'
  
  let isOver = $state(false)
  let fileInput: HTMLInputElement | null = $state(null)
  
  const maximumSize = 1 * 1024 * 1024 * 1024 // 1GB
  
  const allowedExtensions = ['.mp4', '.mov', '.txt', '.docx', '.zip']
  
  function getFileExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase()
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
  
  function onClear() {
    uploadStore.reset()
    if (fileInput) fileInput.value = ''
  }
</script>

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
  {#if $uploadStore.uploaded}
    <div class="flex flex-col items-center">
      <span class="mb-2">📄 {$uploadStore.uploaded.name}</span>
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
    <span class="text-center mb-2">Upload or drag a file</span>
    <span class="text-xs text-stone-400">Allowed: MP4, MOV, TXT, DOCX, ZIP — Max size: 1GB</span>
  {/if}

  <input type="file" class="hidden" bind:this={fileInput} onchange={handleInput} accept=".mp4,.mov,.txt,.docx,.zip" />
</div>
