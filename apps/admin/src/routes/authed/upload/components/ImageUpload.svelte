<script lang="ts">
  import { uploadStore } from '../stores/upload-store'
  import Img from '$lib/assets/img.svg'

  let imageInput: HTMLInputElement | null = $state(null)
  let imageUrl = $state<string | null>(null)
  let { label, required = false } = $props<{ label: string; required?: boolean }>()

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

<div class="space-y-1.25 w-full">
  <label class="text-sm text-[#707070]" for="image-upload"
    >{label}{#if required}<span class="text-[#ff0000] pl-0.5">*</span>{/if}</label
  >
  <div
    class="border border-dashed min-h-62.5 rounded-lg border-[#1A1A2E33] p-3 bg-cream flex flex-col items-center justify-center gap-4"
    id="image-upload"
  >
    {#if $uploadStore.files.preview}
      <div class="relative w-full min-h-62.5 flex items-center justify-center">
        <img
          src={URL.createObjectURL($uploadStore.files.preview)}
          alt="Preview"
          class="max-h-50 max-w-full rounded object-contain"
        />

        <button
          type="button"
          onclick={() => uploadStore.setUploadedImage(null)}
          class="absolute top-2 right-2 w-6 h-6 rounded-full bg-white border border-[#ddd4cc] text-[#71707a] hover:text-red-500 flex items-center justify-center text-xs transition-colors"
        >
          ✕
        </button>
      </div>
    {:else}
      <p class="text-base font-semibold text-dark">Upload or drag your headshots</p>
      <button
        type="button"
        onclick={() => imageInput?.click()}
        class="w-10.5 h-10.5 rounded-full bg-primary text-white flex items-center justify-center text-4xl"
      >
        +
      </button>
    {/if}

    <input type="file" class="hidden" bind:this={imageInput} onchange={handleImageInput} accept="image/*" />
  </div>
  <span class="text-[10px] text-right text-[#747474] w-full block">
    .avif, .gif, .jpg, .png, .svg, .webp files accepted
  </span>
</div>
