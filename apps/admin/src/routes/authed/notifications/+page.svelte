<script lang="ts">
  import Code from '$lib/assets/code.svg'
  import RowActionMenu from '$lib/components/RowActionMenu.svelte'
  import { formatDate } from '../files/helper'
  import { NotificationsMenuItems } from './constantc'

  let activeMenuRow = $state<number | null>(null)

  let notifications = $state([
    {
      id: 1,
      date: '2026-04-14T10:23:11.000Z',
      text: 'message1',
      read: false,
    },
    {
      id: 2,
      date: '2026-04-14T14:05:47.000Z',
      text: 'message2',
      read: false,
    },
  ])

  function getMenuItems(read: boolean) {
    return read ? NotificationsMenuItems.filter((item) => item.action !== 'mark-read') : NotificationsMenuItems
  }

  function handleMenuSelect(index: number, action?: string) {
    if (action !== 'mark-read') return
    notifications[index].read = true
  }
</script>

{#if !notifications.length}
  <span class="text-sm font-medium text-[#1A1A2E]/60">You have no listings yet.</span>
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
              <th class="px-4 py-2.75">File name</th>
              <th class="px-4 py-2.75"></th>
            </tr>
          </thead>
          <tbody>
            {#each notifications as tx, i (tx.id)}
              <tr
                class="border-b border-[#ddd] last:border-0 {activeMenuRow === i
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
                    onOpenChange={(open) => (activeMenuRow = open ? i : null)}
                    onSelect={(item) => handleMenuSelect(i, item.action)}
                  />
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <div class="pt-2.75 text-[13px] font-medium text-[#b6b4b7] flex justify-between">
      <span class="text-[#1A1A2E]/60">Showing {notifications.length} of {notifications.length} listings</span>
      <div class="flex items-center gap-1.5">
        <img src={Code} alt="Previous" class="h-3 rotate-180 inline-block mr-1" />
        <span class="cursor-pointer hover:text-[#555] mr-4.75">Previous</span>
        <span class="cursor-pointer hover:text-[#555]">Next</span>
        <img src={Code} alt="Next" class="size-3 inline-block ml-1" />
      </div>
    </div>
  </div>
{/if}
