<script lang="ts">
  import PublisherNameInput from '$lib/components/PublisherNameInput.svelte'
  import { publisherStore } from '$lib/stores/publisher.svelte'

  let { onUpdate } = $props<{
    onUpdate?: (name: string, avatar: string) => void
  }>()

  let publisherName = $state(publisherStore.title || '')

  $effect(() => {
    onUpdate?.(publisherName, publisherStore.avatarUrl || '')
  })
</script>

<div class="w-full">
  <PublisherNameInput bind:value={publisherName} />
</div>
