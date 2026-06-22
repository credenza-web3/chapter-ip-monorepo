<script lang="ts">
  import { onMount } from 'svelte'
  import {
    DEFAULT_IMAGE_URL,
    ETHNICITY_OPTIONS,
    EYE_COLOR_OPTIONS,
    HAIR_COLOR_OPTIONS,
    HEIGHT_RANGES,
    LICENSE_TYPE_OPTIONS,
    PERMITTED_USE_OPTIONS,
    UNION_OPTIONS,
    WEIGHT_RANGES,
    createEmptyLikenessFilters,
    filterLikenessItems,
    filtersToSearchParams,
    getActiveFilterCount,
    getRecentLikenesses,
    type LikenessFilters,
    type LikenessItem,
  } from './likeness'

  type FilterMenu =
    | 'ethnicity'
    | 'height'
    | 'weight'
    | 'eyeColor'
    | 'hairColor'
    | 'union'
    | 'licenseType'
    | 'permittedUse'
  type MultiFilterKey = 'ethnicity' | 'eyeColor' | 'hairColor' | 'union' | 'licenseType' | 'permittedUse'
  type FilterOption = { value: string; label: string }
  type HeightRangeValue = NonNullable<LikenessFilters['height']>
  type WeightRangeValue = NonNullable<LikenessFilters['weight']>

  let { items, filters: initialFilters = createEmptyLikenessFilters() } = $props<{
    items: LikenessItem[]
    filters?: LikenessFilters
  }>()

  let carousel = $state<HTMLDivElement>()
  let canScrollBack = $state(false)
  let canScrollForward = $state(false)
  let openFilter = $state<FilterMenu | null>(null)
  let filters = $derived(cloneFilters(initialFilters))

  const recentItems = $derived(getRecentLikenesses(items))
  const filteredItems = $derived(filterLikenessItems(items, filters))
  const activeFilterCount = $derived(getActiveFilterCount(filters))

  function cloneFilters(value: LikenessFilters): LikenessFilters {
    return {
      ...value,
      ethnicity: [...value.ethnicity],
      eyeColor: [...value.eyeColor],
      hairColor: [...value.hairColor],
      union: [...value.union],
      licenseType: [...value.licenseType],
      permittedUse: [...value.permittedUse],
    }
  }

  function updateCarouselState() {
    if (!carousel) return
    canScrollBack = carousel.scrollLeft > 1
    canScrollForward = carousel.scrollLeft + carousel.clientWidth < carousel.scrollWidth - 1
  }

  function scrollCarousel(direction: -1 | 1) {
    carousel?.scrollBy({ left: direction * Math.min(carousel.clientWidth * 0.8, 400), behavior: 'smooth' })
  }

  function useDefaultImage(event: Event) {
    const image = event.currentTarget as HTMLImageElement
    if (image.src !== DEFAULT_IMAGE_URL) image.src = DEFAULT_IMAGE_URL
  }

  function updateUrl() {
    const searchParams = filtersToSearchParams(filters)
    const query = searchParams.toString()
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
    window.history.replaceState(window.history.state, '', nextUrl)
  }

  function toggleFilter(menu: FilterMenu) {
    openFilter = openFilter === menu ? null : menu
  }

  function toggleMultiFilter(key: MultiFilterKey, value: string) {
    const values: string[] = filters[key]
    const nextValues = values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
    filters = { ...filters, [key]: nextValues } as LikenessFilters
    updateUrl()
  }

  function isFilterSelected(key: MultiFilterKey, value: string): boolean {
    return (filters[key] as string[]).includes(value)
  }

  function setHeightRange(value: HeightRangeValue) {
    filters.height = filters.height === value ? null : value
    updateUrl()
  }

  function setWeightRange(value: WeightRangeValue) {
    filters.weight = filters.weight === value ? null : value
    updateUrl()
  }

  function clearFilters() {
    filters = createEmptyLikenessFilters()
    openFilter = null
    updateUrl()
  }

  function getMenuCount(menu: FilterMenu): number {
    switch (menu) {
      case 'ethnicity':
        return filters.ethnicity.length
      case 'height':
        return filters.height ? 1 : 0
      case 'weight':
        return filters.weight ? 1 : 0
      case 'eyeColor':
        return filters.eyeColor.length
      case 'hairColor':
        return filters.hairColor.length
      case 'union':
        return filters.union.length
      case 'licenseType':
        return filters.licenseType.length
      case 'permittedUse':
        return filters.permittedUse.length
    }
  }

  function optionClasses(selected: boolean): string {
    return [
      'rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
      selected ? 'border-primary bg-[#eee8ff] text-primary' : 'border-[#e4ded6] bg-[#efebe5] text-[#77757d]',
    ].join(' ')
  }

  function filterButtonClasses(active: boolean): string {
    return [
      'inline-flex h-9 items-center gap-2 rounded-sm border px-3.5 text-sm font-semibold transition-colors',
      active ? 'border-[#d6d0c8] bg-[#efebe5] text-dark' : 'border-[#ddd8d1] bg-[#f8f5f1] text-[#77757d]',
    ].join(' ')
  }

  onMount(() => {
    updateCarouselState()
    const resizeObserver = new ResizeObserver(updateCarouselState)
    if (carousel) resizeObserver.observe(carousel)

    return () => resizeObserver.disconnect()
  })
</script>

{#snippet chevron(open: boolean)}
  <svg
    aria-hidden="true"
    class={`size-4 transition-transform ${open ? 'rotate-180' : ''}`}
    viewBox="0 0 20 20"
    fill="none"
  >
    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
  </svg>
{/snippet}

{#snippet filterButton(menu: FilterMenu, label: string)}
  <div class="relative">
    <button
      type="button"
      class={filterButtonClasses(openFilter === menu)}
      aria-expanded={openFilter === menu}
      onclick={() => toggleFilter(menu)}
    >
      <span>{label}{getMenuCount(menu) > 0 ? ` (${getMenuCount(menu)})` : ''}</span>
      {@render chevron(openFilter === menu)}
    </button>

    {#if openFilter === menu}
      <div
        class="absolute left-0 top-full z-20 mt-2 w-max max-w-[min(82vw,520px)] rounded-lg border border-[#e4ded6] bg-[#f8f5f1] p-5 shadow-[0_18px_36px_rgba(42,36,30,0.14)]"
      >
        {#if menu === 'ethnicity'}
          {@render optionPills('ethnicity', ETHNICITY_OPTIONS)}
        {:else if menu === 'height'}
          {@render heightRangePanel()}
        {:else if menu === 'weight'}
          {@render weightRangePanel()}
        {:else if menu === 'eyeColor'}
          {@render optionPills('eyeColor', EYE_COLOR_OPTIONS)}
        {:else if menu === 'hairColor'}
          {@render optionPills('hairColor', HAIR_COLOR_OPTIONS)}
        {:else if menu === 'union'}
          {@render optionPills('union', UNION_OPTIONS)}
        {:else if menu === 'licenseType'}
          {@render optionPills('licenseType', LICENSE_TYPE_OPTIONS)}
        {:else if menu === 'permittedUse'}
          {@render optionPills('permittedUse', PERMITTED_USE_OPTIONS)}
        {/if}
      </div>
    {/if}
  </div>
{/snippet}

{#snippet optionPills(key: MultiFilterKey, options: readonly FilterOption[])}
  <div class="flex flex-wrap gap-2">
    {#each options as option (option.value)}
      <button
        type="button"
        class={optionClasses(isFilterSelected(key, option.value))}
        aria-pressed={isFilterSelected(key, option.value)}
        onclick={() => toggleMultiFilter(key, option.value)}
      >
        {option.label}
      </button>
    {/each}
  </div>
{/snippet}

{#snippet heightRangePanel()}
  <div class="grid max-w-xl grid-cols-1 gap-2 min-[420px]:grid-cols-2 md:grid-cols-3">
    {#each HEIGHT_RANGES as range (range.value)}
      <button
        type="button"
        class={optionClasses(filters.height === range.value)}
        aria-pressed={filters.height === range.value}
        onclick={() => setHeightRange(range.value)}
      >
        {range.label}
      </button>
    {/each}
  </div>
{/snippet}

{#snippet weightRangePanel()}
  <div class="grid max-w-xl grid-cols-1 gap-2 min-[420px]:grid-cols-2 md:grid-cols-3">
    {#each WEIGHT_RANGES as range (range.value)}
      <button
        type="button"
        class={optionClasses(filters.weight === range.value)}
        aria-pressed={filters.weight === range.value}
        onclick={() => setWeightRange(range.value)}
      >
        {range.label}
      </button>
    {/each}
  </div>
{/snippet}

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
          <a
            href={`/authed/likeness/${item.id}`}
            class="flex w-[min(88vw,382px)] shrink-0 snap-start gap-3 rounded-sm border border-[#ddd8d1] p-2.5 sm:w-[382px]"
          >
            <img
              src={item.imageUrl}
              alt={item.name || 'Likeness'}
              class="size-20 shrink-0 rounded-md object-cover"
              onerror={useDefaultImage}
            />
            <div class="min-w-0 py-1">
              <h2 class="truncate text-base font-semibold text-dark">{item.name || 'Unnamed likeness'}</h2>
              {#if item.bio}
                <p class="mt-1 line-clamp-2 text-sm leading-5 text-[#77757d]">{item.bio}</p>
              {/if}
            </div>
          </a>
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

    <div class="mt-6 flex flex-wrap items-center gap-2">
      <button
        type="button"
        class="inline-flex size-9 items-center justify-center rounded-sm border border-[#ddd8d1] bg-[#f8f5f1] text-[#77757d] transition-colors disabled:opacity-40"
        aria-label="Clear filters"
        disabled={activeFilterCount === 0}
        onclick={clearFilters}
      >
        <svg aria-hidden="true" class="size-5" viewBox="0 0 20 20" fill="none">
          <path d="M4 6H16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          <path d="M4 14H16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          <path d="M7 4V8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          <path d="M13 12V16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
      </button>

      {@render filterButton('ethnicity', 'Ethnicity')}
      {@render filterButton('height', 'Height')}
      {@render filterButton('weight', 'Weight')}
      {@render filterButton('eyeColor', 'Eye Color')}
      {@render filterButton('hairColor', 'Hair Color')}
      {@render filterButton('union', 'Union')}
      {@render filterButton('licenseType', 'License Type')}
      {@render filterButton('permittedUse', 'Permitted Uses')}
    </div>

    <div class="my-6 border-t border-[#e5e0d9]"></div>

    {#if filteredItems.length > 0}
      <div class="grid grid-cols-1 gap-x-6 gap-y-12 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {#each filteredItems as item (item.id)}
          <a href={`/authed/likeness/${item.id}`} class="group min-w-0">
            <img
              src={item.imageUrl}
              alt={item.name || 'Likeness'}
              class="aspect-square w-full rounded-lg object-cover transition-opacity group-hover:opacity-85"
              onerror={useDefaultImage}
            />
            <h3 class="mt-3 truncate text-base font-semibold text-dark">{item.name || 'Unnamed likeness'}</h3>
            {#if item.bio}
              <p class="mt-1 line-clamp-2 text-sm leading-[18px] text-[#77757d]">{item.bio}</p>
            {/if}
          </a>
        {/each}
      </div>
    {:else}
      <div class="py-16 text-center">
        <p class="text-[#77757d]">
          {items.length > 0 ? 'No likenesses match these filters.' : 'No likenesses available.'}
        </p>
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
