<script lang="ts">
  import { goto } from '$app/navigation'
  import { configStore, ContractName } from '$lib/stores/config.svelte'
  import LocationPurchasePage from './LocationPurchasePage.svelte'
  import { normalizeLocation } from './locationDetails'
  import type { LocationDetails } from './types'

  let { data } = $props()

  let locationDetails = $state<LocationDetails | null>(null)
  let loading = $state(true)

  $effect(() => {
    const id = data.id
    let cancelled = false

    loading = true
    locationDetails = null
    ;(async () => {
      try {
        const content = await data.trpcClient.contents.getContentById.query({ id })
        if (cancelled) return

        if (content.status !== 'ACTIVE') {
          await goto('/authed/location')
          return
        }

        let authorName = ''
        if (content.sub) {
          try {
            const { items } = await data.trpcClient.publishers.findPublishers.query({
              sub: content.sub,
              limit: '1',
            })
            authorName = items[0]?.title ?? ''
          } catch {
            authorName = ''
          }
        }

        const normalized = normalizeLocation(
          content,
          configStore.getContractAddress(ContractName.CONTENT_NFT),
          authorName,
        )
        if (cancelled) return

        if (!normalized) {
          await goto('/authed/location')
          return
        }

        locationDetails = normalized
      } catch {
        if (!cancelled) await goto('/authed/location')
      } finally {
        if (!cancelled) loading = false
      }
    })()

    return () => {
      cancelled = true
    }
  })
</script>

{#if loading}
  <div
    class="mx-auto w-full max-w-293.75 animate-pulse rounded-3xl border border-[#1a1a2e0d] bg-[#f8f5f1] px-5 py-10 sm:px-10 sm:py-12 lg:px-25 lg:pb-16"
    aria-label="Loading location"
  >
    <div class="h-7.25 w-64 rounded bg-[#e4dfd8]"></div>
    <div class="mt-2 h-4 w-48 rounded bg-[#e4dfd8]"></div>
    <div class="mt-3 h-5 max-w-237.5 rounded bg-[#e4dfd8]"></div>
    <div class="mt-2 h-5 w-3/4 rounded bg-[#e4dfd8]"></div>

    <div class="mt-11 grid gap-12 lg:grid-cols-[400px_minmax(0,515px)] lg:gap-8.25">
      <div>
        <div class="aspect-400/216 bg-[#e4dfd8]"></div>
        <div class="mt-5 flex gap-2">
          <div class="h-7.5 w-24 rounded-full bg-[#e4dfd8]"></div>
          <div class="h-7.5 w-24 rounded-full bg-[#e4dfd8]"></div>
        </div>
        <div class="mt-8 h-5 w-40 rounded bg-[#e4dfd8]"></div>
        <div class="mt-4 grid grid-cols-2 gap-3">
          <div class="h-11 rounded bg-[#e4dfd8]"></div>
          <div class="h-11 rounded bg-[#e4dfd8]"></div>
        </div>
      </div>
      <div>
        <div class="h-5 w-32 rounded bg-[#e4dfd8]"></div>
        <div class="mt-6.25 h-27.5 rounded-md border border-[#ded9d2] bg-[#e4dfd8]"></div>
        <div class="mt-5.5 h-13 rounded bg-[#e4dfd8]"></div>
      </div>
    </div>
  </div>
{:else if locationDetails}
  <LocationPurchasePage {locationDetails} />
{/if}
