<script lang="ts">
  import Img from '$lib/assets/img.svg'
  import { likenessStore } from '../stores/likeness-store'

  type MediaFileKey = 'preview' | 'headshots' | 'bodyShots' | 'voiceSamples' | 'videoReels'
  type MediaKind = 'image' | 'audio' | 'video'

  let imageInput: HTMLInputElement | null = $state(null)
  let {
    label,
    required = false,
    fileKey = 'preview',
    mediaKind = 'image',
  } = $props<{
    label: string
    required?: boolean
    fileKey?: MediaFileKey
    mediaKind?: MediaKind
  }>()

  const selectedFile = $derived($likenessStore.files[fileKey as MediaFileKey])
  const accept = $derived(
    mediaKind === 'image' ? 'image/*' : mediaKind === 'audio' ? 'audio/*' : 'video/*',
  )
  const helperText = $derived(
    mediaKind === 'image'
      ? '.avif, .gif, .jpg, .png, .svg, .webp files accepted'
      : mediaKind === 'audio'
        ? '.mp3, .wav, .m4a, .aac files accepted'
        : '.mp4, .mov, .webm files accepted',
  )
  const emptyStateText = $derived(
    mediaKind === 'image' ? `Upload or drag your ${label.toLowerCase()}` : `Upload or drag your ${label.toLowerCase()} file`,
  )

  function handleImageInput(event: Event) {
    const target = event?.target as HTMLInputElement
    const file = target?.files?.[0]
    if (!file) return

    const typeValid =
      (mediaKind === 'image' && file.type.startsWith('image/')) ||
      (mediaKind === 'audio' && file.type.startsWith('audio/')) ||
      (mediaKind === 'video' && file.type.startsWith('video/'))

    if (!typeValid) {
      alert(`Please select a valid ${mediaKind} file`)
      if (target) target.value = ''
      return
    }

    likenessStore.setMediaFile(fileKey, file)
  }
</script>

<div class="space-y-1.25 w-full">
  <label class="text-sm text-[#707070]" for="image-upload"
    >{label}{#if required}<span class="text-[#ff0000] pl-0.5">*</span>{/if}</label
  >
  <div
    class="border border-dashed h-62.5 rounded-lg border-[#1A1A2E33] p-3 bg-cream flex flex-col items-center justify-center gap-4"
    id="image-upload"
  >
    {#if selectedFile}
      <div class="relative w-full min-h-62.5 flex items-center justify-center">
        {#if mediaKind === 'image'}
          <img src={URL.createObjectURL(selectedFile)} alt="Preview" class="max-h-50 max-w-full rounded object-contain" />
        {:else}
          <div class="flex flex-col items-center gap-2 text-center">
            <div class="text-4xl">{mediaKind === 'audio' ? '🎵' : '🎬'}</div>
            <div class="text-sm font-medium text-dark">{selectedFile.name}</div>
          </div>
        {/if}

        <button
          type="button"
          onclick={() => likenessStore.setMediaFile(fileKey, null)}
          class="absolute top-2 right-2 w-6 h-6 rounded-full bg-white border border-[#ddd4cc] text-[#71707a] hover:text-red-500 flex items-center justify-center text-xs transition-colors"
        >
          ✕
        </button>
      </div>
    {:else}
      <p class="text-base font-semibold text-dark">{emptyStateText}</p>
      <button
        type="button"
        onclick={() => imageInput?.click()}
        class="w-10.5 h-10.5 rounded-full bg-primary text-white flex items-center justify-center text-4xl"
      >
        +
      </button>
    {/if}

    <input type="file" class="hidden" bind:this={imageInput} onchange={handleImageInput} accept={accept} />
  </div>
  <span class="text-[10px] text-right text-[#747474] w-full block">{helperText}</span>
</div>
