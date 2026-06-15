<script lang="ts">
  import type { LikenessPurchase } from './types'

  type Image = LikenessPurchase['images'][number]

  let {
    media,
    onSelectImage,
  }: {
    media: LikenessPurchase['media']
    onSelectImage: (image: Image) => void
  } = $props()

  function getMediaTypeLabel(type: 'audio' | 'video' | 'file') {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }
</script>

{#if media.length > 0}
  <section aria-label="Likeness media" class="mt-16">
    <div class="grid grid-cols-2 gap-4.5 sm:grid-cols-3 lg:grid-cols-5">
      {#each media as item (item.id)}
        {#if item.type === 'image'}
          <button
            type="button"
            class="aspect-square overflow-hidden bg-[#202225] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-primary"
            aria-label={`Open ${item.alt}`}
            onclick={() => onSelectImage(item)}
          >
            <img src={item.src} alt={item.alt} class="size-full object-cover" />
          </button>
        {:else}
          <div
            class="flex aspect-square flex-col items-center justify-center gap-2 bg-[#202225] px-3 text-center text-white"
            aria-label={`${item.type} ${item.label}`}
          >
            <span class="text-sm font-semibold">{getMediaTypeLabel(item.type)}</span>
            <span class="max-w-full truncate text-xs text-white/65">{item.label}</span>
          </div>
        {/if}
      {/each}
    </div>
  </section>
{/if}
