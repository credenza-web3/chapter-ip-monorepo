<script lang="ts">
  import Code from '$lib/assets/code.svg'
  import RowActionMenu from '$lib/components/RowActionMenu.svelte'
  import { formatDate } from '../files/helper'
  import { NotificationsMenuItems } from './constants'
  import { getTrpcClient } from '$lib/stores/trpc-client'
  import { NOTIFICATIONS_PAGE_SIZE } from '$lib/constants'
  import { notificationStore } from '$lib/stores/notification.svelte'
  import type { TNotificationItem } from '@repo/notifications'

  let activeMenuRow = $state<number | null>(null)
  let loading = $state(true)
  let items = $state<TNotificationItem[]>([])

  let cursorStack = $state<Array<string | undefined>>([undefined])
  let currentPage = $state(0)
  let hasNext = $state(false)

  const trpcClient = getTrpcClient()

  const loadPage = async (cursor?: string) => {
    loading = true
    try {
      const result = await trpcClient.notifications.findMyNotifications.query({
        limit: String(NOTIFICATIONS_PAGE_SIZE),
        sort: 'createdAt',
        order: 'desc',
        ...(cursor ? { cursor } : {}),
      })
      items = result.items
      const nextCursor = result.cursor.next
      hasNext = !!nextCursor && nextCursor !== result.cursor.current

      if (hasNext) {
        cursorStack = [...cursorStack, nextCursor!]
      }
    } catch (err) {
      console.error('Failed to load notifications', err)
      items = []
    } finally {
      loading = false
    }
  }

  loadPage()

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

  const pageItems = $derived(
    [...items].sort((a, b) => {
      if (!a.readAt && b.readAt) return -1
      if (a.readAt && !b.readAt) return 1
      return 0
    }),
  )

  async function markAsRead(id: string) {
    try {
      await trpcClient.notifications.markMyNotificationAsRead.mutate({ id })
      items = items.map((x) => (x.id === id ? { ...x, readAt: new Date().toISOString() } : x))
      notificationStore.update((n) => n.map((x) => (x.id === id ? { ...x, readAt: new Date().toISOString() } : x)))
    } catch (err) {
      console.error('Failed to mark notification as read', err)
    }
  }

  async function markAllAsRead() {
    try {
      await trpcClient.notifications.markAllMyNotificationsAsRead.mutate()
      items = items.map((x) => ({ ...x, readAt: x.readAt ?? new Date().toISOString() }))
      notificationStore.update((n) => n.map((x) => ({ ...x, readAt: x.readAt ?? new Date().toISOString() })))
    } catch (err) {
      console.error('Failed to mark all notifications as read', err)
    }
  }

  async function handleMenuSelect(item: { text: string; href?: string; action?: string }, notificationId: string) {
    if (item.action === 'mark-read') await markAsRead(notificationId)
    else if (item.action === 'mark-all-read') await markAllAsRead()
  }

  function getMenuItems(isRead: boolean) {
    return isRead ? NotificationsMenuItems.filter((item) => item.action !== 'mark-read') : NotificationsMenuItems
  }
</script>

{#if !pageItems.length && !loading}
  <span class="text-sm font-medium text-[#1A1A2E]/60">You have no notifications yet.</span>
{:else}
  <div class="min-h-screen border border-[#1a1a2e0d] rounded-3xl bg-[#f8f5f1] p-8 md:p-12.5">
    <h1 class="text-lg font-semibold mb-4.5">Notifications</h1>
    <div class="border border-[#ddd] rounded-md overflow-visible">
      <div class="overflow-x-auto">
        <table class="w-full text-sm font-medium text-[#1A1A2E]/60 table-fixed">
          <thead>
            <tr class="text-left border-b border-[#ddd] bg-cream">
              <th class="px-4 py-2.75 align-middle">
                <div class="flex items-center gap-2.5 cursor-pointer select-none hover:text-[#555]">
                  Date
                  <img src={Code} alt="Sort" class="size-2.5 rotate-90" />
                </div>
              </th>
              <th class="px-4 py-2.75">Message</th>
              <th class="px-4 py-2.75"></th>
            </tr>
          </thead>
          <tbody>
            {#if loading}
              <tr>
                <td colspan="3" class="px-4 py-6 text-center">
                  <span class="loading loading-spinner loading-sm"></span>
                </td>
              </tr>
            {:else}
              {#each pageItems as tx, i (tx.id)}
                {@const isRead = !!tx.readAt}
                <tr
                  class="border-b border-[#ddd] last:border-0 {activeMenuRow === i
                    ? 'bg-[#ece7df]'
                    : isRead
                      ? 'bg-[#f3f0ea] text-[#1A1A2E]/40'
                      : i % 2 === 0
                        ? 'bg-[#f8f5f1]'
                        : 'bg-cream'}"
                >
                  <td class="px-4 py-1.5">{formatDate(tx.createdAt)}</td>
                  <td class="px-4 py-1.5">{tx.message ?? tx.title ?? '—'}</td>
                  <td class="px-4 py-1.5 text-right">
                    <RowActionMenu
                      items={getMenuItems(isRead)}
                      buttonLabel={`Open actions for ${tx.message ?? tx.title}`}
                      onOpenChange={(open) => (activeMenuRow = open ? i : null)}
                      onSelect={(item) => handleMenuSelect(item, tx.id)}
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
      <span class="text-[#1A1A2E]/60">Showing {pageItems.length} notifications</span>
      <div class="flex items-center gap-1.5">
        <button
          onclick={prevPage}
          disabled={currentPage === 0 || loading}
          class="flex items-center gap-1 cursor-pointer hover:text-[#555] disabled:opacity-30 disabled:cursor-default"
        >
          <img src={Code} alt="Previous" class="h-3 rotate-180 inline-block mr-1" />
          Previous
        </button>
        <button
          onclick={nextPage}
          disabled={!hasNext || loading}
          class="flex items-center gap-1 cursor-pointer hover:text-[#555] disabled:opacity-30 disabled:cursor-default ml-4.75"
        >
          Next
          <img src={Code} alt="Next" class="size-3 inline-block ml-1" />
        </button>
      </div>
    </div>
  </div>
{/if}
