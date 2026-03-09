<script lang="ts">
  import { uploadStore } from '../stores/upload-store'

  let imageInput: HTMLInputElement | null = $state(null)
  let imageUrl = $state<string | null>(null)

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
    imageUrl = URL.createObjectURL(file)
  }

  // function onImageClear() {
  //   uploadStore.setUploadedImage(null)
  //   if (imageInput) imageInput.value = ''
  //   // Clean up URL object
  //   if (imageUrl) {
  //     URL.revokeObjectURL(imageUrl)
  //     imageUrl = null
  //   }
  // }
</script>

<div class="mb-4 mt-10 ">
  <label for="image-select" class="block font-semibold">Select Cover Image 
    <span class="text-sm font-medium">(Optional)</span>
  </label>
  <span class="text-xs text-[#747474]">
    600px by 600px .jpg, .gif, .png images will work best
  </span>
  <div class="flex items-start gap-4 mt-5 flex-col"> 
    {#if $uploadStore.uploadedImage}
      <div class="flex flex-col gap-3">
        <!-- Image Preview -->
        {#if imageUrl}
          <div class="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
            <img 
              src={imageUrl} 
              alt=""
              class="w-full h-full object-cover"
            />
          </div>
        {/if}
      </div>
    {/if}
    <button id="image-select" class="text-[#6e4ff7] text-xs font-medium cursor-pointer" onclick={() => imageInput?.click()} type="button">
      Upload a new cover image
    </button>
  </div>
  <input type="file" class="hidden" bind:this={imageInput} onchange={handleImageInput} accept="image/*" />
</div>
