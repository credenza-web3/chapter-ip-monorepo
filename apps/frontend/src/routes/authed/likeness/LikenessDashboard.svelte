<script lang="ts">
  import { onMount } from 'svelte'
  import { getRecentLikenesses, type LikenessItem } from './likeness'

  let { items } = $props<{
    items: LikenessItem[]
  }>()

  let carousel = $state<HTMLDivElement>()
  let canScrollBack = $state(false)
  let canScrollForward = $state(false)

  const recentItems = $derived(getRecentLikenesses(items))

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

<div class="mx-auto w-full max-w-360 px-6">
  <section class="mb-7" aria-labelledby="recently-added-heading">
    <div class="mb-3 flex items-center justify-between gap-4">
      <h1 id="recently-added-heading" class="text-base font-bold text-dark">Recently added</h1>

      {#if recentItems.length > 0}
        <div class="hidden items-center gap-1 sm:flex">
          <button
            type="button"
            aria-label="Previous likenesses"
            class="flex size-7 items-center justify-center rounded-md border border-[#ddd8d1] bg-transparent text-lg disabled:opacity-30"
            disabled={!canScrollBack}
            onclick={() => scrollCarousel(-1)}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next likenesses"
            class="flex size-7 items-center justify-center rounded-md border border-[#ddd8d1] bg-transparent text-lg disabled:opacity-30"
            disabled={!canScrollForward}
            onclick={() => scrollCarousel(1)}
          >
            ›
          </button>
        </div>
      {/if}
    </div>

    {#if recentItems.length > 0}
      <div
        bind:this={carousel}
        class="carousel-track flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1"
        onscroll={updateCarouselState}
      >
        {#each recentItems as item (item.id)}
          <article
            class="flex w-[min(88vw,382px)] shrink-0 snap-start gap-3 rounded-sm border border-[#ddd8d1] p-2.5 sm:w-[382px]"
          >
            <img src={item.imageUrl} alt={item.name || 'Likeness'} class="size-20 shrink-0 rounded-md object-cover" />
            <div class="min-w-0 py-1">
              <h2 class="truncate text-base font-semibold text-dark">{item.name || 'Unnamed likeness'}</h2>
              {#if item.bio}
                <p class="mt-1 line-clamp-2 text-sm leading-5 text-[#77757d]">{item.bio}</p>
              {/if}
            </div>
          </article>
        {/each}
      </div>
    {:else}
      <p class="text-sm text-[#77757d]">No likenesses have been added yet.</p>
    {/if}
  </section>

  <section
    class="rounded-sm border border-[#ebe6df] bg-[#f8f5f1] px-4 py-8 sm:px-6 lg:px-13 lg:py-12"
    aria-labelledby="likeness-heading"
  >
    <h2 id="likeness-heading" class="text-xl font-bold text-dark">Likeness</h2>
    <div class="my-6 border-t border-[#e5e0d9]"></div>

    {#if items.length > 0}
      <div class="grid grid-cols-1 gap-x-6 gap-y-12 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {#each items as item (item.id)}
          <article class="min-w-0">
            <img
              src={item.imageUrl}
              alt={item.name || 'Likeness'}
              class="aspect-square w-full rounded-lg object-cover"
            />
            <h3 class="mt-3 truncate text-base font-semibold text-dark">{item.name || 'Unnamed likeness'}</h3>
            {#if item.bio}
              <p class="mt-1 line-clamp-2 text-sm leading-[18px] text-[#77757d]">{item.bio}</p>
            {/if}
          </article>
        {/each}
      </div>
    {:else}
      <div class="py-16 text-center">
        <p class="text-[#77757d]">No likenesses available.</p>
      </div>
    {/if}
  </section>
</div>

<style>
  .carousel-track {
    scrollbar-width: none;
  }

  .carousel-track::-webkit-scrollbar {
    display: none;
  }
</style>
