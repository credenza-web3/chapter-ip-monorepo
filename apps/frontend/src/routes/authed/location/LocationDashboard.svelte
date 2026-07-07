<script lang="ts">
  import LocationGrid from './LocationGrid.svelte'
  import LocationRecentCarousel from './LocationRecentCarousel.svelte'
  import { createEmptyLocationFilters, getRecentLocations, type LocationFilters, type LocationItem } from './location'

  let {
    items,
    recentItems: recentSourceItems = items,
    filters = createEmptyLocationFilters(),
  } = $props<{
    items: LocationItem[]
    recentItems?: LocationItem[]
    filters?: LocationFilters
  }>()

  const recentItems = $derived(getRecentLocations(recentSourceItems))
  const hasActiveSearch = $derived(filters.query.trim().length > 0)
</script>

<div class="mx-auto w-full max-w-360 px-6">
  <LocationRecentCarousel items={recentItems} />

  <section
    class="rounded-2xl border border-[#ebe6df] bg-[#f8f5f1] px-4 py-8 sm:px-6 lg:px-13 lg:py-12"
    aria-labelledby="location-heading"
  >
    <h2 id="location-heading" class="text-xl font-bold text-dark">Location</h2>

    <div class="my-6 border-t border-[#e5e0d9]"></div>

    <LocationGrid {items} hasActiveFilters={hasActiveSearch} />
  </section>
</div>
