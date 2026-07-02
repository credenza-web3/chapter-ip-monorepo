<script lang="ts">
  import { onMount } from 'svelte'
  import { useDefaultImage } from '$lib/content/image'
  import type { LocationItem } from './location'

  let { items } = $props<{
    items: LocationItem[]
  }>()

  let carousel = $state<HTMLDivElement>()
  let canScrollBack = $state(false)
  let canScrollForward = $state(false)

  function updateCarouselState() {
    if (!carousel) return
    canScrollBack = carousel.scrollLeft > 1
    canScrollForward = carousel.scrollLeft + carousel.clientWidth < carousel.scrollWidth - 1
  }

  function scrollCarousel(direction: -1 | 1) {
    carousel?.scrollBy({ left: direction * Math.min(carousel.clientWidth * 0.8, 400), behavior: 'smooth' })
  }

  onMount(() => {
    updateCarouselState()
    const resizeObserver = new ResizeObserver(updateCarouselState)
    if (carousel) resizeObserver.observe(carousel)

    return () => resizeObserver.disconnect()
  })
</script>

<section class="mb-7" aria-labelledby="recently-added-heading">
  <div class="mb-3 flex items-center justify-between gap-4">
    <h1 id="recently-added-heading" class="text-base font-bold text-dark">Recently added</h1>

    {#if items.length > 0}
      <div class="hidden items-center gap-1 sm:flex">
        <button
          type="button"
          aria-label="Previous locations"
          class="flex size-7 items-center justify-center rounded-md border border-[#ddd8d1] bg-transparent text-lg disabled:opacity-30"
          disabled={!canScrollBack}
          onclick={() => scrollCarousel(-1)}
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Next locations"
          class="flex size-7 items-center justify-center rounded-md border border-[#ddd8d1] bg-transparent text-lg disabled:opacity-30"
          disabled={!canScrollForward}
          onclick={() => scrollCarousel(1)}
        >
          ›
        </button>
      </div>
    {/if}
  </div>

  {#if items.length > 0}
    <div
      bind:this={carousel}
      class="carousel-track flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1"
      onscroll={updateCarouselState}
    >
      {#each items as item (item.id)}
        <article
          class="flex w-[min(88vw,382px)] shrink-0 snap-start gap-3 rounded-sm border border-[#ddd8d1] p-2.5 sm:w-[382px]"
        >
          <img
            src={item.imageUrl}
            alt={item.name || 'Location'}
            class="size-20 shrink-0 rounded-md object-cover"
            onerror={useDefaultImage}
          />
          <div class="min-w-0 py-1">
            <h2 class="truncate text-base font-semibold text-dark">{item.name || 'Unnamed location'}</h2>
            {#if item.description}
              <p class="mt-1 line-clamp-2 text-sm leading-5 text-[#77757d]">{item.description}</p>
            {/if}
          </div>
        </article>
      {/each}
    </div>
  {:else}
    <p class="text-sm text-[#77757d]">No locations have been added yet.</p>
  {/if}
</section>

<style>
  .carousel-track {
    scrollbar-width: none;
  }

  .carousel-track::-webkit-scrollbar {
    display: none;
  }
</style>
