<script lang="ts">
  import ContentCard from './ContentCard.svelte'

  interface Props {
    contentItems: any[]
    searchQuery: string
    contentContract: any
  }

  let { contentItems, searchQuery, contentContract }: Props = $props()
</script>

<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
  {#if contentItems.length === 0}
    <div class="alert col-span-full">
      {#if searchQuery}
        <span>No products found matching "{searchQuery}"</span>
      {:else}
        <span>No content here yet.</span>
      {/if}
    </div>
  {:else}
    {#each contentItems as item}
      <ContentCard {item} {contentContract} />
    {/each}
  {/if}
</div>
