<script lang="ts">
  import '../app.css'
  import { onMount } from 'svelte'
  import { Toast, Header, Footer } from '@repo/ui-components'
  import { authStore } from '$lib'
  import NavLink from '$lib/components/NavLink.svelte'
  import { publisherStore } from '$lib/stores/publisher.svelte'
  import { page } from '$app/state'
  import { headerStore } from '$lib/stores/header.store'

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

  let subscription: ReturnType<typeof trpcClient.notifications.onMessage.subscribe>
  const notifications: TNotificationItem[] = $state([])
  const trpcClient = createClient({
    trpcUrl: import.meta.env.VITE_TRPC_URL || 'http://localhost:8060/trpc',
    getAccessTokenFn: () => authStore.state.accessToken!,
  })

  $effect(() => {
    if (!authStore.state.accessToken) return
    ;(async () => {
      subscription = trpcClient.notifications.onMessage.subscribe(undefined, {
        onData(info) {
          console.log('NOTIFICATION RECEIVED', info)
          const data = info as TNotificationItem
          notifications.push(data)
        },
      })
      const { items, cursor } = await trpcClient.notifications.findMyNotifications.query({
        limit: '10',
        sort: 'createdAt',
        order: 'desc',
      })
      notifications.push(...items)
    })()
  })

  async function markAsRead(id: string) {
    await trpcClient.notifications.markMyNotificationAsRead.mutate({ id })
    const n = notifications.find((n) => n.id === id)
    if (n) n.readAt = new Date().toISOString()
  }

  onMount(() => {
    return () => {
      subscription.unsubscribe()
    }
  })
</script>

<svelte:head>
  <title>chapter ip</title>
</svelte:head>

<Toast />
<div class="flex min-h-screen flex-col overflow-x-hidden bg-cream text-dark">
  <Header {authStore} {menuItems} pathname={page.url.pathname} showCreateButton={true} {notifications}>
    <div class="flex h-full items-stretch w-full justify-between md:pl-15 pl-2">
      <div class="flex items-stretch">
        <NavLink href="/authed/files">Dashboard</NavLink>
      </div>
      <div class="flex items-center md:gap-7.25 gap-4">
        <NotificationsDropdown {notifications} onMarkRead={markAsRead} />
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
