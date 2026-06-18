<script lang="ts">
  import '../app.css'
  import { Toast, Header, Footer } from '@repo/ui-components'
  import { authStore } from '$lib'
  import NavLink from '$lib/components/NavLink.svelte'
  import { publisherStore } from '$lib/stores/publisher.svelte'
  import { page } from '$app/state'
  import { notificationStore } from '$lib/stores/notification.svelte'

  import { getTrpcClient } from '$lib/stores/trpc-client'
  import { NOTIFICATIONS_DROPDOWN_LIMIT } from '$lib/constants'
  import { NOTIFICATION_TYPE, type TNotificationItem } from '@repo/notifications'
  import NotificationsDropdown from '$lib/components/NotificationsDropdown.svelte'

  let { children } = $props()
  const menuItems = [
    {
      text: 'Profile',
      href: '/authed/profile',
    },
    // {
    //   text: 'My Listings',
    //   href: '/authed/files',
    // },
    // {
    //   text: 'My History',
    //   href: '/authed/history',
    // },
    // {
    //   text: 'Billing',
    //   href: '/authed/billing',
    // },
    {
      text: 'Notifications',
      href: '/authed/notifications',
    },
  ]

  $effect(() => {
    if (!authStore.state.accessToken) return

    const trpcClient = getTrpcClient()
    const subscription = trpcClient.notifications.onMessage.subscribe(undefined, {
      onData(info) {
        const data = info as TNotificationItem
        notificationStore.update((n) => [data, ...n])
      },
    })

    ;(async () => {
      try {
        const { items } = await trpcClient.notifications.findMyNotifications.query({
          limit: String(NOTIFICATIONS_DROPDOWN_LIMIT),
          sort: 'createdAt',
          order: 'desc',
        })

        const filtered = items.filter((item) => item.type !== NOTIFICATION_TYPE.LICENSE_PURCHASED)

        notificationStore.set(filtered)
      } catch (err) {
        console.error('Failed to fetch notifications', err)
      }
    })()

    return () => subscription.unsubscribe()
  })

  async function markAsRead(id: string) {
    try {
      await getTrpcClient().notifications.markMyNotificationAsRead.mutate({ id })
      notificationStore.update((n) => n.map((x) => (x.id === id ? { ...x, readAt: new Date().toISOString() } : x)))
    } catch (err) {
      console.error('Failed to mark notification as read', err)
    }
  }

  async function markAllAsRead() {
    try {
      await getTrpcClient().notifications.markAllMyNotificationsAsRead.mutate()
      notificationStore.update((n) => n.map((x) => ({ ...x, readAt: x.readAt ?? new Date().toISOString() })))
    } catch (err) {
      console.error('Failed to mark all notifications as read', err)
    }
  }
</script>

<svelte:head>
  <title>chapter ip</title>
</svelte:head>

<Toast />
<div class="flex min-h-screen flex-col overflow-x-hidden bg-cream text-dark">
  <Header {authStore} {menuItems} pathname={page.url.pathname} showCreateButton={true}>
    <div class="flex h-full items-stretch w-full justify-between md:pl-15 pl-2">
      <div class="flex items-stretch">
        <NavLink href="/authed/files">Dashboard</NavLink>
      </div>
      <div class="flex items-center md:gap-7.25 gap-4">
        <NotificationsDropdown
          notifications={$notificationStore}
          onMarkRead={markAsRead}
          onMarkAllRead={markAllAsRead}
        />
        <a
          href="/authed/profile"
          aria-label="Open profile"
          class="my-auto flex items-center justify-center rounded-full bg-primary text-white font-semibold w-7 h-7"
        >
          {publisherStore.title?.slice(0, 1)?.toUpperCase() || 'U'}
        </a>
      </div>
    </div>
  </Header>
  <main class="flex flex-1 flex-col bg-cream px-6 pt-9.75">
    <div class="flex-1">
      {@render children?.()}
    </div>
    <div class="px-6">
      <Footer />
    </div>
  </main>
</div>
