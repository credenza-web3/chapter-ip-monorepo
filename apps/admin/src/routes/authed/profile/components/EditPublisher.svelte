<script lang="ts">
  import PublisherNameInput from '$lib/components/PublisherNameInput.svelte'
  import { publisherStore } from '$lib/stores/publisher.svelte'

  let { onUpdate, onPriceUpdate } = $props<{
    onUpdate?: (name: string, avatar: string) => void
    onPriceUpdate?: (price: number) => void
  }>()

  let publisherName = $state(publisherStore.title || '')

  let avatarUrl = publisherStore.avatarUrl || ''

  // Notify parent of changes
  $effect(() => {
    if (onUpdate) {
      onUpdate(publisherName, avatarUrl)
    }
  })

  // Notify parent of price changes if callback provided
  $effect(() => {
    if (onPriceUpdate) {
      onPriceUpdate(0) // This component doesn't handle price, but we provide the callback
    }
  })
</script>

<div class="flex flex-col gap-2 w-full">
  <h2 class="font-semibold text-base text-dark">Details</h2>
  <div class="w-full">
    <PublisherNameInput bind:value={publisherName} />
  </div>
</div>
