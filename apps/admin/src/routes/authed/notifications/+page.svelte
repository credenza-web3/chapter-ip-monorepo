<script lang="ts">
  import Code from '$lib/assets/code.svg'
  import RowActionMenu from '$lib/components/RowActionMenu.svelte'
  import { formatDate } from '../files/helper'
  import { notifications, notificationsMenuItems } from './constants'

  let activeMenuRow = $state<number | null>(null)
  let currentPage = $state(1)

  const pageSize = 1
  const totalPages = $derived(Math.max(1, Math.ceil(notifications.length / pageSize)))
  const safeCurrentPage = $derived(Math.min(currentPage, totalPages))
  const paginatedNotifications = $derived(
    notifications
      .map((notification, sourceIndex) => ({ notification, sourceIndex }))
      .slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize),
  )

  function getMenuItems(read: boolean) {
    return read ? notificationsMenuItems.filter((item) => item.action !== 'mark-read') : notificationsMenuItems
  }

  function handleMenuSelect(index: number, action?: string) {
    if (action !== 'mark-read') return
    notifications[index].read = true
  }
</script>

{#if !notifications.length}
  <span class="text-sm font-medium text-[#1A1A2E]/60">You have no listings yet.</span>
{:else}
  <div class="min-h-screen border border-[#1a1a2e0d] rounded-3xl bg-[#f8f5f1] p-2 py-6 md:p-12.5">
    <h1 class="text-lg font-semibold pl-2 md:pl-0">Notifications</h1>
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
              <th class="px-4 py-2.75">File name</th>
              <th class="px-4 py-2.75"></th>
            </tr>
          </thead>
          <tbody>
            {#each paginatedNotifications as item, i (item.notification.id)}
              {@const tx = item.notification}
              {@const notificationIndex = item.sourceIndex}
              <tr
                class="border-b border-[#ddd] last:border-0 {activeMenuRow === notificationIndex
                  ? 'bg-[#ece7df]'
                  : tx.read
                    ? 'bg-[#f3f0ea] text-[#1A1A2E]/40'
                    : i % 2 === 0
                      ? 'bg-[#f8f5f1]'
                      : 'bg-cream'}"
              >
                <td class="px-4 py-1.5">{formatDate(tx.date)}</td>
                <td class="px-4 py-1.5">{tx.text}</td>
                <td class="px-4 py-1.5 text-right">
                  <RowActionMenu
                    items={getMenuItems(tx.read)}
                    buttonLabel={`Open actions for ${tx.text}`}
                    onOpenChange={(open) => (activeMenuRow = open ? notificationIndex : null)}
                    onSelect={(item) => handleMenuSelect(notificationIndex, item.action)}
                  />
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <div class="pt-2.75 text-[13px] font-medium text-[#b6b4b7] flex justify-between px-2.5 md:px-0">
      <span class="text-[#1A1A2E]/60">
        Showing {paginatedNotifications.length ? (safeCurrentPage - 1) * pageSize + 1 : 0}-
        {Math.min(safeCurrentPage * pageSize, notifications.length)} of {notifications.length} notifications
      </span>
      <div class="flex items-center gap-1.5">
        <button
          type="button"
          class="inline-flex items-center mr-4.75 disabled:opacity-40 disabled:cursor-not-allowed"
          onclick={() => (currentPage = Math.max(1, safeCurrentPage - 1))}
          disabled={safeCurrentPage === 1}
        >
          <img src={Code} alt="Previous" class="h-3 rotate-180 inline-block mr-1" />
          <span class="cursor-pointer hover:text-[#555]">Previous</span>
        </button>
        <button
          type="button"
          class="inline-flex items-center disabled:opacity-40 disabled:cursor-not-allowed"
          onclick={() => (currentPage = Math.min(totalPages, safeCurrentPage + 1))}
          disabled={safeCurrentPage === totalPages}
        >
          <span class="cursor-pointer hover:text-[#555]">Next</span>
          <img src={Code} alt="Next" class="size-3 inline-block ml-1" />
        </button>
      </div>
    </div>
  </div>
{/if}
