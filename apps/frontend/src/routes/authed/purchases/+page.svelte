<script lang="ts">
  import { configStore, ContractName } from '$lib/stores/config.svelte'
  import type { LikenessContent } from '@repo/content-types/likeness'
  import { normalizeLikeness } from '../likeness/[id]/likenessDetails'
  import LikenessPurchasedItem from './LikenessPurchasedItem.svelte'
  import type { LikenessPurchaseRow, PurchasedContentToken } from './types'

  let { data: rawData } = $props()

  let data = $derived(rawData)
  const contentContractAddress = configStore.getContractAddress(ContractName.CONTENT_NFT)

  function getNormalizerFiles(files: PurchasedContentToken['files']): LikenessContent['files'] {
    return files.flatMap((file) => {
      const filename = file.filename?.trim() || file.label?.trim() || ''
      const label = file.label?.trim() || filename
      const id = file.id?.trim() || filename
      const mimetype = file.mimetype?.trim() || ''

      if (!filename || !mimetype) return []

      return [{ id, filename, label, mimetype }]
    })
  }

  function toLikenessPurchaseRow(purchase: PurchasedContentToken): LikenessPurchaseRow[] {
    const likeness = normalizeLikeness(
      {
        id: purchase.id,
        tokenId: purchase.tokenId,
        metadata: purchase.metadata as LikenessContent['metadata'],
        files: getNormalizerFiles(purchase.files),
      },
      contentContractAddress,
    )

    return likeness ? [{ purchase, likeness }] : []
  }

  const purchases = $derived([...data.lifetimeLicenses, ...data.onetimeLicenses] as PurchasedContentToken[])
  const likenessPurchases = $derived(purchases.flatMap(toLikenessPurchaseRow))
</script>

<main class="min-h-screen bg-[#f5f1ec] px-4 py-8 text-[#1a1a2e] sm:px-6 lg:px-8">
  <div class="mx-auto w-full max-w-5xl">
    <header class="mb-8 sm:mb-10">
      <h1 class="font-heading text-4xl leading-11 font-semibold text-[#1a1a2e]">Purchases</h1>
    </header>

    {#if !purchases.length}
      <div
        class="flex flex-col gap-4 border border-[#1a1a2e1a] bg-white p-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <span>You haven't made any purchases yet.</span>
        <a href="/authed/likeness" class="btn rounded-none border-primary bg-primary px-5 text-white">Browse Items</a>
      </div>
    {:else if !likenessPurchases.length}
      <div class="border border-[#1a1a2e1a] bg-white p-6">
        <p>No likeness purchases yet.</p>
      </div>
    {:else}
      <section aria-label="Purchased likenesses" class="divide-y divide-[#1a1a2e1a] border-y border-[#1a1a2e1a]">
        {#each likenessPurchases as row (`${row.purchase.licenseTokenId}-${row.purchase.id}`)}
          <LikenessPurchasedItem purchase={row.purchase} likeness={row.likeness} trpcClient={data.trpcClient} />
        {/each}
      </section>
    {/if}
  </div>
</main>
