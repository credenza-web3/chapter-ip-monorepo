<script lang="ts">
  import type { LikenessPurchase } from './purchase'

  type Image = LikenessPurchase['images'][number]

  let {
    images,
    onSelectImage,
  }: {
    images: LikenessPurchase['images']
    onSelectImage: (image: Image) => void
  } = $props()

  const media = Array.from({ length: 15 }, (_, index) => ({
    id: index + 1,
    type: index < 10 ? ('image' as const) : ('video' as const),
  }))
</script>

<section aria-label="Likeness media" class="mt-16">
  <div class="grid grid-cols-2 gap-4.5 sm:grid-cols-3 lg:grid-cols-5">
    {#each media as item (item.id)}
      {#if item.type === 'image'}
        <button
          type="button"
          class="aspect-square bg-[#202225] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-primary"
          aria-label={`Open media image ${item.id}`}
          onclick={() => onSelectImage(images[(item.id - 1) % images.length])}
        ></button>
      {:else}
        <div
          class="flex aspect-square items-center justify-center bg-[#202225]"
          aria-label={`Mock video ${item.id - 10}`}
        >
          <svg
            data-testid="media-play-icon"
            aria-hidden="true"
            class="h-5 w-4 text-white"
            viewBox="0 0 16 20"
            fill="none"
          >
            <path d="M1 1.5 14 10 1 18.5V1.5Z" stroke="currentColor" stroke-width="1.5"></path>
          </svg>
        </div>
      {/if}
    {/each}
  </div>
</section>
