<script lang="ts">
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'
  import { configStore, ContractName } from '$lib/stores/config.svelte'
  import LikenessPurchasePage from './LikenessPurchasePage.svelte'
  import { toLikenessPurchase } from './purchase'
  import type { LikenessPurchase } from './types'

  let { data } = $props()

  let purchase = $state<LikenessPurchase | null>(null)
  let loading = $state(true)

  const skeletonThumbnails = Array.from({ length: 4 }, (_, index) => index)
  const skeletonMedia = Array.from({ length: 5 }, (_, index) => index)

  onMount(async () => {
    try {
      const content = await data.trpcClient.contents.getContentById.query({ id: data.id })
      purchase = toLikenessPurchase(content, configStore.getContractAddress(ContractName.CONTENT_NFT))
      if (!purchase) await goto('/authed/likeness')
    } catch {
      await goto('/authed/likeness')
    } finally {
      loading = false
    }
  })
</script>

{#if loading}
  <div
    class="mx-auto w-full max-w-293.75 animate-pulse rounded-3xl border border-[#1a1a2e0d] bg-[#f8f5f1] px-5 py-10 sm:px-10 sm:py-12 lg:px-25 lg:pb-16"
    aria-label="Loading likeness"
  >
    <div class="h-7.25 w-64 rounded bg-[#e4dfd8]"></div>
    <div class="mt-3 h-5 max-w-237.5 rounded bg-[#e4dfd8]"></div>
    <div class="mt-2 h-5 w-3/4 rounded bg-[#e4dfd8]"></div>

    <div class="mt-11 grid gap-12 lg:grid-cols-[400px_minmax(0,515px)] lg:gap-8.25">
      <div>
        <div class="aspect-square bg-[#e4dfd8]"></div>
        <div class="mt-2.5 grid grid-cols-4 gap-1.75">
          {#each skeletonThumbnails as thumbnail (thumbnail)}
            <div class="aspect-square bg-[#e4dfd8]"></div>
          {/each}
        </div>
        <div class="mt-5 h-5 w-40 rounded bg-[#e4dfd8]"></div>
        <div class="mt-3 h-28 w-64 rounded bg-[#e4dfd8]"></div>
      </div>
      <div>
        <div class="h-5 w-32 rounded bg-[#e4dfd8]"></div>
        <div class="mt-6.25 h-32.75 rounded-md border border-[#ded9d2] bg-[#e4dfd8]"></div>
        <div class="mt-6 ml-auto h-8 w-28 rounded bg-[#e4dfd8]"></div>
        <div class="mt-2 h-13 rounded bg-[#e4dfd8]"></div>
        <div class="mt-9 border-t border-[#ded9d2] pt-9">
          <div class="h-5 w-32 rounded bg-[#e4dfd8]"></div>
        </div>
        <div class="mt-5 h-24 rounded bg-[#e4dfd8]"></div>
      </div>
    </div>

    <div class="mt-16 grid grid-cols-2 gap-4.5 sm:grid-cols-3 lg:grid-cols-5">
      {#each skeletonMedia as media (media)}
        <div class="aspect-square bg-[#e4dfd8]"></div>
      {/each}
    </div>
  </div>
{:else if purchase}
  <LikenessPurchasePage {purchase} />
{/if}
