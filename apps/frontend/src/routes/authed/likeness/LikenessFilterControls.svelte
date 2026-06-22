<script lang="ts">
  import {
    ETHNICITY_OPTIONS,
    EYE_COLOR_OPTIONS,
    HAIR_COLOR_OPTIONS,
    HEIGHT_RANGES,
    LICENSE_TYPE_OPTIONS,
    PERMITTED_USE_OPTIONS,
    UNION_OPTIONS,
    WEIGHT_RANGES,
    type LikenessFilters,
  } from './likeness'
  import { filterButtonClasses, getMenuCount, optionClasses } from './LikenessDashboard.helpers'
  import type {
    FilterMenu,
    FilterOption,
    HeightRangeValue,
    MultiFilterKey,
    WeightRangeValue,
  } from './LikenessDashboard.types'

  let {
    filters,
    activeFilterCount,
    openFilter,
    onClearFilters,
    onToggleFilter,
    onToggleMultiFilter,
    onSetHeightRange,
    onSetWeightRange,
  } = $props<{
    filters: LikenessFilters
    activeFilterCount: number
    openFilter: FilterMenu | null
    onClearFilters: () => void
    onToggleFilter: (menu: FilterMenu) => void
    onToggleMultiFilter: (key: MultiFilterKey, value: string) => void
    onSetHeightRange: (value: HeightRangeValue) => void
    onSetWeightRange: (value: WeightRangeValue) => void
  }>()

  function isFilterSelected(key: MultiFilterKey, value: string): boolean {
    return (filters[key] as string[]).includes(value)
  }
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
      onclick={() => onToggleFilter(menu)}
    >
      <span>{label}{getMenuCount(filters, menu) > 0 ? ` (${getMenuCount(filters, menu)})` : ''}</span>
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
        onclick={() => onToggleMultiFilter(key, option.value)}
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
        onclick={() => onSetHeightRange(range.value)}
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
        onclick={() => onSetWeightRange(range.value)}
      >
        {range.label}
      </button>
    {/each}
  </div>
{/snippet}

<div class="mt-6 flex flex-wrap items-center gap-2">
  <button
    type="button"
    class="inline-flex size-9 items-center justify-center rounded-sm border border-[#ddd8d1] bg-[#f8f5f1] text-[#77757d] transition-colors disabled:opacity-40"
    aria-label="Clear filters"
    disabled={activeFilterCount === 0}
    onclick={onClearFilters}
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
