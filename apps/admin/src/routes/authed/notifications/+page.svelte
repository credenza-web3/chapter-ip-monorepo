<script lang="ts">
  import Code from '$lib/assets/code.svg'
  import RowActionMenu from '$lib/components/RowActionMenu.svelte'
  import { formatDate } from '../files/helper'
  import { NotificationsMenuItems } from './constants'
  import { notificationStore } from '$lib/stores/notification.svelte'
  import { createClient } from '@repo/trpc/client'
  import { authStore } from '$lib'

  let activeMenuRow = $state<number | null>(null)
  const allNotifications = $derived(
    $notificationStore.toSorted((a, b) => {
      if (!a.readAt && b.readAt) return -1
      if (a.readAt && !b.readAt) return 1
      return 0
    }),
  )

  async function handleMenuSelect(item: { text: string; href?: string; action?: string }, notificationId: string) {
    if (item.action === 'mark-read') {
      const trpcClient = createClient({
        trpcUrl: import.meta.env.VITE_TRPC_URL || 'http://localhost:8060/trpc',
        getAccessTokenFn: () => authStore.state.accessToken ?? '',
      })
      await trpcClient.notifications.markMyNotificationAsRead.mutate({ id: notificationId })
      notificationStore.update((n) =>
        n.map((x) => (x.id === notificationId ? { ...x, readAt: new Date().toISOString() } : x)),
      )
    }
  }

  function getMenuItems(isRead: boolean) {
    return isRead ? NotificationsMenuItems.filter((item) => item.action !== 'mark-read') : NotificationsMenuItems
  }
</script>

{#if !allNotifications.length}
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
            {#each allNotifications as tx, i (tx.id)}
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
          </tbody>
        </table>
      </div>
    </div>

    <div class="pt-2.75 text-[13px] font-medium text-[#b6b4b7] flex justify-between">
      <span class="text-[#1A1A2E]/60">Showing {allNotifications.length} notifications</span>
      <div class="flex items-center gap-1.5">
        <img src={Code} alt="Previous" class="h-3 rotate-180 inline-block mr-1" />
        <span class="cursor-pointer hover:text-[#555] mr-4.75">Previous</span>
        <span class="cursor-pointer hover:text-[#555]">Next</span>
        <img src={Code} alt="Next" class="size-3 inline-block ml-1" />
      </div>
    </div>
  </div>
{/if}
