<script lang="ts">
  import { uploadStore } from '../stores/upload-store'

  let imageInput: HTMLInputElement | null = $state(null)

  function handleImageInput(event: Event) {
    const target = event?.target as HTMLInputElement
    const file = target?.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      if (target) target.value = ''
      return
    }

    uploadStore.setUploadedImage(file)
  }

  function onImageClear() {
    uploadStore.setUploadedImage(null)
    if (imageInput) imageInput.value = ''
  }
</script>

<div class="mb-4">
  <label for="image-select" class="block text-sm font-medium text-gray-700 mb-2">Select Cover Image (Optional)</label>
  <div class="flex items-center gap-4">
    <button id="image-select" class="btn btn-outline btn-sm" onclick={() => imageInput?.click()} type="button">
      {$uploadStore.uploadedImage ? 'Change Image' : 'Select Image'}
    </button>
    {#if $uploadStore.uploadedImage}
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">📷 {$uploadStore.uploadedImage.name}</span>
        <button onclick={onImageClear} class="btn btn-xs btn-outline" type="button"> Clear </button>
      </div>
    {/if}
  </div>
  <input type="file" class="hidden" bind:this={imageInput} onchange={handleImageInput} accept="image/*" />
</div>
