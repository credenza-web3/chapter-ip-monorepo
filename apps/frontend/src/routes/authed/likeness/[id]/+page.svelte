<script lang="ts">
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'
  import LikenessPurchasePage from './LikenessPurchasePage.svelte'
  import { toLikenessPurchase, type LikenessPurchase } from './purchase'

  let { data } = $props()

  let purchase = $state<LikenessPurchase | null>(null)
  let loading = $state(true)

  onMount(async () => {
    try {
      const content = await data.trpcClient.contents.getContentById.query({ id: data.id })
      purchase = toLikenessPurchase(content)
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
    class="mx-auto w-full max-w-[1175px] animate-pulse rounded-3xl border border-[#1a1a2e0d] bg-[#f8f5f1] px-5 py-10 sm:px-10 lg:px-[100px]"
    aria-label="Loading likeness"
  >
    <div class="mx-auto size-24 rounded-full bg-[#e4dfd8]"></div>
    <div class="mx-auto mt-4 h-8 w-56 rounded bg-[#e4dfd8]"></div>
    <div class="mt-12 grid gap-10 lg:grid-cols-[400px_1fr]">
      <div class="aspect-[1.18] rounded-xl bg-[#e4dfd8]"></div>
      <div class="space-y-5">
        <div class="h-5 w-24 rounded bg-[#e4dfd8]"></div>
        <div class="h-20 rounded bg-[#e4dfd8]"></div>
        <div class="h-5 w-40 rounded bg-[#e4dfd8]"></div>
        <div class="h-32 rounded bg-[#e4dfd8]"></div>
      </div>
    </div>
  </div>
{:else if purchase}
  <LikenessPurchasePage {purchase} />
{/if}
