<script lang="ts">
  import { onMount } from 'svelte'
  import type { AppRouter, TRPCClient } from '@repo/trpc/client'
  import { DEFAULT_IMAGE_URL, getLikenessImageUrl, type LikenessItem } from './likeness'

  let {
    item,
    trpcClient,
    alt,
    class: className = '',
  } = $props<{
    item: LikenessItem
    trpcClient: TRPCClient<AppRouter>
    alt: string
    class?: string
  }>()

  let imageElement: HTMLImageElement
  let imageUrl = $state(DEFAULT_IMAGE_URL)

  onMount(() => {
    let destroyed = false
    let observer: IntersectionObserver | undefined

    const loadImage = async () => {
      observer?.disconnect()
      const resolvedUrl = await getLikenessImageUrl(trpcClient, item.id, item.headshotFilename)
      if (!destroyed) imageUrl = resolvedUrl
    }

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) void loadImage()
        },
        { rootMargin: '240px' },
      )
      observer.observe(imageElement)
    } else {
      void loadImage()
    }

    return () => {
      destroyed = true
      observer?.disconnect()
    }
  })
</script>

<img
  bind:this={imageElement}
  src={imageUrl}
  {alt}
  class={className}
  onerror={() => {
    imageUrl = DEFAULT_IMAGE_URL
  }}
/>
