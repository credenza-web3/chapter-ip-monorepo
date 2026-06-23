<script lang="ts">
  import RowActionMenu from '$lib/components/RowActionMenu.svelte'
  import { formatDate } from '../files/helper'
  import { HistoryMenuItems } from './constants'
  import { getTrpcClient } from '$lib/stores/trpc-client'
  import { notify, ToastType } from '@repo/ui-components'
  import { HISTORY_PAGE_SIZE } from '$lib/constants'
  import type { TPurchaseHistoryItem } from './constants'

  let loading = $state(true)
  let items = $state<TPurchaseHistoryItem[]>([])
  let totalCount = $state(0)

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
      totalCount = result.totalCount
      const nextCursor = result.cursor.next
      hasNext = !!nextCursor && nextCursor !== result.cursor.current

      if (hasNext) {
        cursorStack = [...cursorStack.slice(0, currentPage + 1), nextCursor!]
      }
    } catch (err) {
      if (cancelled) return
      console.error('Failed to load history', err)
      items = []
      notify('Failed to load history. Please try again.', ToastType.FAIL)
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

  async function handleMenuSelect(item: { text: string; href?: string; action?: string }, index: number) {
    if (item.action === 'view-content') {
      const purchase = items[index]
      if (purchase?.txHash) {
        window.open(`https://testnet.snowtrace.io/tx/${purchase.txHash}`, '_blank')
      }
    }
  }
</script>

<div class="min-h-screen border border-[#1a1a2e0d] rounded-3xl bg-[#f8f5f1] p-8 md:p-12.5">
  <h1 class="text-lg font-semibold mb-6.25">History</h1>
  {#if !items.length && !loading}
    <span class="text-sm font-medium text-[#1A1A2E]/60">No purchase history yet.</span>
  {:else}
    <div class="border border-[#ddd] rounded-md overflow-visible">
      <div class="overflow-x-auto">
        <table class="min-w-190 w-full table-fixed text-sm font-medium text-[#1A1A2E]/60">
          <thead>
            <tr class="text-left border-b border-[#ddd] bg-cream">
              <th class="px-4 py-2.75">Date</th>
              <th class="px-4 py-2.75">Event</th>
              <th class="px-4 py-2.75">Item</th>
              <th class="w-40 px-4 py-2.75">Tx Hash</th>
              <th class="px-4 py-2.75">Credit</th>
              <th class="px-4 py-2.75">Debit</th>
              <th class="px-4 py-2.75"></th>
            </tr>
          </thead>
          <tbody>
            {#if loading}
              <tr>
                <td colspan="7" class="px-4 py-6 text-center">
                  <span class="loading loading-spinner loading-sm"></span>
                </td>
              </tr>
            {:else}
              {#each items as tx, i (tx.id)}
                <tr
                  class="border-b border-[#ddd] last:border-0 {i % 2 === 0
                    ? 'bg-[#f8f5f1]'
                    : 'bg-cream'} text-sm font-bold"
                >
                  <td class="px-4 py-1.5">{formatDate(tx.createdAt)}</td>
                  <td class="px-4 py-1.5">Purchase</td>
                  <td class="px-4 py-1.5">{tx.licenseType === 0 ? 'One-time license' : 'Full-time license'}</td>
                  <td class="w-40 whitespace-nowrap px-4 py-1.5 font-mono text-xs" title={tx.txHash || undefined}>
                    {tx.txHash ? `${tx.txHash.slice(0, 6)}...${tx.txHash.slice(-4)}` : '—'}
                  </td>

                  <td class="px-4 py-1.5">
                    {tx.priceFiat
                      ? `$${(Number(tx.priceFiat) / 100).toFixed(2)}`
                      : tx.priceEther
                        ? `${tx.priceEther} ETH`
                        : tx.priceToken
                          ? `${tx.priceToken} tokens`
                          : '—'}
                  </td>
                  <td class="px-4 py-1.5">-</td>
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
      <span class="text-[#1A1A2E]/60">
        Showing {items.length ? currentPage * HISTORY_PAGE_SIZE + 1 : 0}-{currentPage * HISTORY_PAGE_SIZE +
          items.length} of {totalCount} transactions
      </span>
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
  {/if}
</div>
