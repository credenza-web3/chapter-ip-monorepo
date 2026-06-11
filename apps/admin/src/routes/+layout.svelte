<script lang="ts">
  import '../app.css'
  import { Toast, Header, Footer } from '@repo/ui-components'
  import { authStore } from '$lib'
  import NavLink from '$lib/components/NavLink.svelte'
  import { publisherStore } from '$lib/stores/publisher.svelte'
  import { page } from '$app/state'
  import { notificationStore } from '$lib/stores/notification.svelte'

  import { createClient } from '@repo/trpc/client'
  import type { TNotificationItem } from '@repo/notifications'
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

  const trpcClient = createClient({
    trpcUrl: import.meta.env.VITE_TRPC_URL || 'http://localhost:8060/trpc',
    getAccessTokenFn: () => authStore.state.accessToken!,
  })

  $effect(() => {
    if (!authStore.state.accessToken) return

    const subscription = trpcClient.notifications.onMessage.subscribe(undefined, {
      onData(info) {
        console.log('NOTIFICATION RECEIVED', info)
        const data = info as TNotificationItem
        notificationStore.update((n) => [...n, data])
      },
    })

    ;(async () => {
      const { items, cursor } = await trpcClient.notifications.findMyNotifications.query({
        limit: '10',
        sort: 'createdAt',
        order: 'desc',
      })
      notificationStore.update((n) => [...n, ...items])
    })()

    return () => {
      subscription.unsubscribe()
    }
  })

  async function markAsRead(id: string) {
    await trpcClient.notifications.markMyNotificationAsRead.mutate({ id })
    notificationStore.update((n) => n.map((x) => (x.id === id ? { ...x, readAt: new Date().toISOString() } : x)))
  }

  async function markAllAsRead() {
    await trpcClient.notifications.markAllMyNotificationsAsRead.mutate()
    notificationStore.update((n) => n.map((x) => ({ ...x, readAt: x.readAt ?? new Date().toISOString() })))
  }
</script>

<svelte:head>
  <title>chapter ip</title>
</svelte:head>

<Toast />
<div class="flex min-h-screen flex-col overflow-x-hidden bg-cream text-dark">
  <Header
    {authStore}
    {menuItems}
    pathname={page.url.pathname}
    showCreateButton={true}
    notifications={$notificationStore}
  >
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
