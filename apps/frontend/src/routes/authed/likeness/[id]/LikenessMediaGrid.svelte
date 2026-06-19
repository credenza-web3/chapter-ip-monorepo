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
            <span class="flex size-8 items-center justify-center text-white/90" aria-hidden="true">
              {#if item.type === 'video'}
                <svg viewBox="0 0 24 24" class="size-7" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="3.5" y="6.5" width="12" height="11" rx="1.5" />
                  <path d="M15.5 10l5-3v10l-5-3" />
                </svg>
              {:else if item.type === 'audio'}
                <svg viewBox="0 0 24 24" class="size-7" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M9 18V5l10-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="16" cy="16" r="3" />
                </svg>
              {:else}
                <svg viewBox="0 0 24 24" class="size-7" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
                  <path d="M14 3.5V8h4" />
                </svg>
              {/if}
            </span>
            <span class="text-sm font-semibold">{getMediaTypeLabel(item.type)}</span>
            <span class="max-w-full truncate text-xs text-white/65">{item.label}</span>
          </div>
        {/if}
      {/each}
    </div>
  </section>
{/if}
