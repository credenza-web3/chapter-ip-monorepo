<script lang="ts">
  import { useDefaultImage } from '$lib/content/image'
  import type { LikenessItem } from './likeness'

  let { items, hasActiveFilters } = $props<{
    items: LikenessItem[]
    hasActiveFilters: boolean
  }>()
</script>

{#if items.length > 0}
  <div class="grid grid-cols-1 gap-x-6 gap-y-12 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
    {#each items as item (item.id)}
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
      {hasActiveFilters ? 'No likenesses match these filters.' : 'No likenesses available.'}
    </p>
  </div>
{/if}
