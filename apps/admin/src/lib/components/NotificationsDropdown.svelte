<script lang="ts">
  import { goto } from '$app/navigation'
  import BellIcon from '$lib/assets/bell.svg'
  import { notificationStore } from '$lib/stores/notification.svelte'
  import { getTrpcClient } from '$lib/stores/trpc-client'
  import { NOTIFICATION_TYPE } from '@repo/notifications'
  import { NotificationsMenuItems } from '../../routes/authed/notifications/constants'

  let activeMenuRow = $state<number | null>(null)

  const trpcClient = getTrpcClient()

  async function markAsRead(id: string) {
    try {
      await trpcClient.notifications.markMyNotificationAsRead.mutate({ id })
      notificationStore.update((n) => n.map((x) => (x.id === id ? { ...x, readAt: new Date().toISOString() } : x)))
    } catch (err) {
      console.error('Failed to mark notification as read', err)
    }
  }

  async function markAllAsRead() {
    try {
      await trpcClient.notifications.markAllMyNotificationsAsRead.mutate()
      notificationStore.update((n) => n.map((x) => ({ ...x, readAt: x.readAt ?? new Date().toISOString() })))
    } catch (err) {
      console.error('Failed to mark all notifications as read', err)
    }
  }

  const sortedNotifications = $derived(
    $notificationStore.toSorted((a, b) => {
      if (!a.readAt && b.readAt) return -1
      if (a.readAt && !b.readAt) return 1
      return 0
    }),
  )
  const unreadNotifications = $derived(sortedNotifications.filter((n) => !n.readAt))
  const hasUnread = $derived(unreadNotifications.length > 0)

  function getMenuItems(isRead: boolean) {
    return isRead ? NotificationsMenuItems.filter((item) => item.action !== 'mark-read') : NotificationsMenuItems
  }

  function selectNotificationMenuItem(id: string, action?: string, href?: string) {
    if (action === 'mark-read') {
      markAsRead(id)
    } else if (href) {
      goto(href)
    }
    activeMenuRow = null
  }

  function formatDateWithOrdinal(date: string) {
    const d = new Date(date)
    const day = d.getDate()

    const suffix =
      day % 10 === 1 && day % 100 !== 11
        ? 'st'
        : day % 10 === 2 && day % 100 !== 12
          ? 'nd'
          : day % 10 === 3 && day % 100 !== 13
            ? 'rd'
            : 'th'

    const month = d.toLocaleString('en-US', { month: 'short' })

    return `${month} ${day}${suffix}`
  }
</script>

<div class="dropdown bg-transparent md:dropdown-left dropdown-end">
  <div
    tabindex="0"
    role="button"
    class="btn bg-transparent border-0 shadow-none hover:bg-transparent active:bg-transparent flex items-center px-0
    text-[15px] font-medium text-[#767682] px-none flex-1"
  >
    <div class="relative cursor-pointer">
      <img src={BellIcon} alt="notifications" class="h-5.75" />
      {#if hasUnread}
        <span class="absolute top-0 -right-1 block w-3 h-3 rounded-full bg-primary border-2 border-[#fef9ee]"></span>
      {/if}
    </div>
  </div>

  <ul
    tabindex="-1"
    class="dropdown-content menu rounded-box z-30 md:w-100 w-[90vw] min-h-162.5 p-3.75 rounded-md shadow-[3px_6px_8px_0_rgba(21,34,50,0.08)]
    border border-[#1A1A2E1A] top-12 bg-cream text-sm font-medium text-left text-[#1A1A2E99]
    md:translate-x-6 max-md:fixed max-md:left-1/2 max-md:-translate-x-1/2 max-md:top-16"
  >
    <div class="flex items-center justify-between">
      <h2 class="text-[13px] font-semibold text-dark">Notifications</h2>
      <button class="text-xs font-medium text-cream rounded-sm bg-primary px-3.75 py-2.5" onclick={markAllAsRead}>
        Mark {unreadNotifications.length} as read
      </button>
    </div>
    <div class="pt-9">
      {#each sortedNotifications as tx, i (tx.id)}
        {@const payload = tx.payload as Record<string, unknown> | undefined}
        {@const content = payload?.['content'] as Record<string, unknown> | undefined}
        {@const metadata = content?.['metadata'] as Record<string, unknown> | undefined}
        {@const itemType = metadata?.['type'] as string | undefined}
        {@const profile = metadata?.['profile'] as Record<string, unknown> | undefined}
        {@const fullLikenesName = profile?.['fullLegalName'] as string | undefined}
        {@const fullLocationsName = metadata?.['name'] as string | undefined}
        <li>
          <div class="flex items-start leading-0">
            <div class="size-1.5 rounded-full bg-primary shrink-0 mt-1.5" class:invisible={!!tx.readAt}></div>
            <div class="flex flex-col items-between justify-start w-full">
              <div class="flex items-center justify-between w-full">
                <p class="text-[13px] font-semibold flex-1 min-w-0 wrap-break-word leading-normal">
                  {itemType ?? ''} [{fullLikenesName ?? fullLocationsName}] {tx.type ===
                  NOTIFICATION_TYPE.CONTENT_CREATED
                    ? 'added to your products'
                    : 'was purchased'}
                </p>
                <div class="relative shrink-0">
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={activeMenuRow === i}
                    aria-label={`Open actions for ${tx.message ?? tx.title}`}
                    class="btn min-h-0 h-auto border-0 bg-transparent px-0 py-0 text-[18px] leading-none tracking-widest text-[#73727c] shadow-none hover:bg-transparent hover:text-[#555] active:bg-transparent"
                    onclick={(event) => {
                      event.stopPropagation()
                      activeMenuRow = activeMenuRow === i ? null : i
                    }}
                  >
                    ···
                  </button>

                  {#if activeMenuRow === i}
                    <ul
                      role="menu"
                      class="absolute right-0 top-full z-50 mt-2 w-40 rounded-md border border-[#1A1A2E]/10 bg-cream p-2 text-left text-sm font-medium text-[#1A1A2E99] shadow-[3px_6px_8px_0_rgba(21,34,50,0.08)]"
                    >
                      {#each getMenuItems(!!tx.readAt) as item (`${item.action || item.href}-${item.text}`)}
                        <li role="none">
                          <button
                            type="button"
                            role="menuitem"
                            class="block w-full rounded-sm px-3 py-2 text-left hover:bg-[#ece7df]"
                            onclick={(event) => {
                              event.stopPropagation()
                              selectNotificationMenuItem(tx.id, item.action, item.href)
                            }}
                          >
                            {item.text}
                          </button>
                        </li>
                      {/each}
                    </ul>
                  {/if}
                </div>
              </div>
              <span class="text-xs font-medium text-[#1A1A2E99]">
                {formatDateWithOrdinal(tx.createdAt)}
              </span>
              {#if i !== sortedNotifications.length - 1}
                <div class="border-t border-[#DDD7D1] mt-3.5"></div>
              {/if}
            </div>
          </div>
        </li>
      {/each}
    </div>

    <div class="flex flex-col h-full mt-auto px-3 pb-3.75">
      <div class="border-t border-[#DDD7D1] mb-3.5"></div>
      <div class="flex items-center justify-between">
        <span class="text-[13px] text-[#1A1A2E99] font-semibold wrap-break-word min-w-0">
          {unreadNotifications.length} of {sortedNotifications.length} unread notifications
        </span>
        <button
          class="text-[13px] font-semibold text-primary hover:opacity-80 transition cursor-pointer"
          onclick={() => {
            goto('/authed/notifications')
          }}
        >
          View all
        </button>
      </div>
    </div>
  </ul>
</div>
