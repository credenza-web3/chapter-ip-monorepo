<script lang="ts">
  import type { LikenessPurchase } from './purchase'

  let {
    image,
    onClose,
  }: {
    image: LikenessPurchase['images'][number]
    onClose: () => void
  } = $props()

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') onClose()
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 sm:p-8"
  role="presentation"
  onclick={(event) => {
    if (event.target === event.currentTarget) onClose()
  }}
>
  <div
    role="dialog"
    aria-modal="true"
    aria-label="Enlarged likeness image"
    tabindex="-1"
    class="relative flex max-h-full max-w-5xl items-center justify-center"
  >
    <img src={image.src} alt={image.alt} class="max-h-[88vh] max-w-full rounded-xl object-contain shadow-2xl" />
    <button
      type="button"
      aria-label="Close image"
      class="absolute top-2 right-2 flex size-10 items-center justify-center rounded-full bg-black/65 text-xl text-white"
      onclick={onClose}
    >
      ×
    </button>
  </div>
</div>
