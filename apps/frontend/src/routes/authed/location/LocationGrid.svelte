<script lang="ts">
  import { useDefaultImage } from '$lib/content/image'
  import type { LocationItem } from './location'

  let { items } = $props<{
    items: LocationItem[]
  }>()
</script>

{#if items.length > 0}
  <div class="grid grid-cols-1 gap-x-6 gap-y-12 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
    {#each items as item (item.id)}
      <a href={`/authed/location/${item.id}`} class="group min-w-0">
        <div class="relative overflow-hidden rounded-lg bg-black">
          <img
            src={item.imageUrl}
            alt={item.name || 'Location'}
            class="aspect-345/175 w-full object-cover transition-opacity group-hover:opacity-85"
            onerror={useDefaultImage}
          />
        </div>
        <h3 class="mt-3 truncate text-base font-semibold text-dark">{item.name || 'Unnamed location'}</h3>
        {#if item.authorName}
          <p class="mt-0.5 text-xs font-medium text-[#747474]">by {item.authorName}</p>
        {/if}
        {#if item.description}
          <p class="mt-1 line-clamp-2 text-sm font-medium leading-4.5 text-[#747474]">{item.description}</p>
        {/if}
      </a>
    {/each}
  </div>
{:else}
  <div class="py-16 text-center">
    <p class="text-[#747474]">No locations available.</p>
  </div>
{/if}
