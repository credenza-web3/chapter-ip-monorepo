<script lang="ts">
  import { useDefaultImage } from './LocationDashboard.helpers'
  import type { LocationItem } from './location'

  let { items } = $props<{
    items: LocationItem[]
  }>()
</script>

{#if items.length > 0}
  <div class="grid grid-cols-1 gap-x-6 gap-y-12 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
    {#each items as item (item.id)}
      <article class="min-w-0">
        <img
          src={item.imageUrl}
          alt={item.name || 'Location'}
          class="aspect-square w-full rounded-lg object-cover"
          onerror={useDefaultImage}
        />
        <h3 class="mt-3 truncate text-base font-semibold text-dark">{item.name || 'Unnamed location'}</h3>
        {#if item.description}
          <p class="mt-1 line-clamp-2 text-sm leading-[18px] text-[#77757d]">{item.description}</p>
        {/if}
      </article>
    {/each}
  </div>
{:else}
  <div class="py-16 text-center">
    <p class="text-[#77757d]">No locations available.</p>
  </div>
{/if}
