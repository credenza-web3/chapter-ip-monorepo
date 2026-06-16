<script lang="ts">
  import RowActionMenu from '$lib/components/RowActionMenu.svelte'
  import { formatDate } from '../files/helper'
  import { HistoryMenuItems } from './constants'
  import { getTrpcClient } from '$lib/stores/trpc-client'
  import { HISTORY_PAGE_SIZE } from '$lib/constants'
  import { goto } from '$app/navigation'

  let loading = $state(true)
  let items = $state<any[]>([])

  let cursorStack = $state<Array<string | undefined>>([undefined])
  let currentPage = $state(0)
  let hasNext = $state(false)

  const trpcClient = getTrpcClient()

  let cancelled = false

  const loadPage = async (cursor?: string) => {
    loading = true
    try {
      const result = await trpcClient.contents.findPurchaseHistory.query({
        limit: String(HISTORY_PAGE_SIZE),
        sort: 'createdAt',
        order: 'desc',
        ...(cursor ? { cursor } : {}),
      })
      if (cancelled) return
      items = result.items
      const nextCursor = result.cursor.next
      hasNext = !!nextCursor && nextCursor !== result.cursor.current

      if (hasNext) {
        cursorStack = [...cursorStack.slice(0, currentPage + 1), nextCursor!]
      }
    } catch (err) {
      if (cancelled) return
      console.error('Failed to load history', err)
      items = []
    } finally {
      if (!cancelled) loading = false
    }
  }

  $effect(() => {
    cancelled = false
    loadPage()
    return () => {
      cancelled = true
    }
  })

  const nextPage = async () => {
    if (!hasNext || loading) return
    currentPage += 1
    await loadPage(cursorStack[currentPage])
  }

  const prevPage = async () => {
    if (currentPage === 0 || loading) return
    currentPage -= 1
    await loadPage(cursorStack[currentPage])
  }

  const LICENSE_LABELS: Record<number, string> = {
    0: 'Lifetime',
    2: 'One-time',
  }

  function getLicenseLabel(type: number): string {
    return LICENSE_LABELS[type] ?? `License #${type}`
  }

  function truncateAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  async function handleMenuSelect(item: { text: string; href?: string; action?: string }, index: number) {
    if (item.action === 'view-content') {
      const purchase = items[index]
      if (purchase?.contentId) {
        await goto(`/authed/files/${purchase.contentId}`)
      }
    }
  }
</script>

{#if !items.length && !loading}
  <span class="text-sm font-medium text-[#1A1A2E]/60">No purchase history yet.</span>
{:else}
  <div class="min-h-screen border border-[#1a1a2e0d] rounded-3xl bg-[#f8f5f1] p-8 md:p-12.5">
    <h1 class="text-lg font-semibold mb-4.5">Purchase History</h1>
    <div class="border border-[#ddd] rounded-md overflow-visible">
      <div class="overflow-x-auto">
        <table class="w-full text-sm font-medium text-[#1A1A2E]/60 table-fixed">
          <thead>
            <tr class="text-left border-b border-[#ddd] bg-cream">
              <th class="px-4 py-2.75">Date</th>
              <th class="px-4 py-2.75">Buyer</th>
              <th class="px-4 py-2.75">Content</th>
              <th class="px-4 py-2.75">License</th>
              <th class="px-4 py-2.75">Price</th>
              <th class="px-4 py-2.75"></th>
            </tr>
          </thead>
          <tbody>
            {#if loading}
              <tr>
                <td colspan="6" class="px-4 py-6 text-center">
                  <span class="loading loading-spinner loading-sm"></span>
                </td>
              </tr>
            {:else}
              {#each items as tx, i (tx.id)}
                <tr class="border-b border-[#ddd] last:border-0 {i % 2 === 0 ? 'bg-[#f8f5f1]' : 'bg-cream'}">
                  <td class="px-4 py-1.5">{formatDate(tx.createdAt)}</td>
                  <td class="px-4 py-1.5 font-mono">{truncateAddress(tx.buyerAddress)}</td>
                  <td class="px-4 py-1.5">
                    <a href="/authed/files/{tx.contentId}" class="hover:text-[#555] underline underline-offset-2">
                      {tx.contentId}
                    </a>
                  </td>
                  <td class="px-4 py-1.5">{getLicenseLabel(tx.licenseType)}</td>
                  <td class="px-4 py-1.5">
                    {tx.priceFiat
                      ? `$${tx.priceFiat}`
                      : tx.priceEther
                        ? `${tx.priceEther} ETH`
                        : tx.priceToken
                          ? `${tx.priceToken} tokens`
                          : '—'}
                  </td>
                  <td class="px-4 py-1.5 text-right">
                    <RowActionMenu
                      items={HistoryMenuItems}
                      buttonLabel={`Open actions for purchase ${tx.id}`}
                      onSelect={(item) => handleMenuSelect(item, i)}
                    />
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>
    <div class="pt-2.75 text-[13px] font-medium text-[#b6b4b7] flex justify-between">
      <span class="text-[#1A1A2E]/60">Showing {items.length} purchases</span>
      <div class="flex items-center gap-1.5">
        <button
          onclick={prevPage}
          disabled={currentPage === 0 || loading}
          class="flex items-center gap-1 cursor-pointer hover:text-[#555] disabled:opacity-30 disabled:cursor-default"
        >
          Previous
        </button>
        <button
          onclick={nextPage}
          disabled={!hasNext || loading}
          class="flex items-center gap-1 cursor-pointer hover:text-[#555] disabled:opacity-30 disabled:cursor-default ml-4.75"
        >
          Next
        </button>
      </div>
    </div>
  </div>
{/if}
