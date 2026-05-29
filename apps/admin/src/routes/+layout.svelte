<script lang="ts">
  import { notificationsMenuItems } from '../routes/authed/notifications/constants'
  import '../app.css'
  import { Toast, Header, Footer } from '@repo/ui-components'
  import { authStore } from '$lib'
  import NavLink from '$lib/components/NavLink.svelte'
  import { publisherStore } from '$lib/stores/publisher.svelte'
  import { page } from '$app/state'
  import BellIcon from '$lib/assets/bell.svg'
  import { notifications } from '../routes/authed/notifications/constants'
  import RowActionMenu from '$lib/components/RowActionMenu.svelte'

  let { children } = $props()
  const menuItems = [
    {
      text: 'Profile',
      href: '/authed/profile',
    },
    {
      text: 'My Listings',
      href: '/authed/files',
    },
    {
      text: 'My History',
      href: '/authed/history',
    },
    // {
    //   text: 'Billing',
    //   href: '/authed/billing',
    // },
  ]

  const browseAndPurchaseItems = [
    // {
    //   text: 'Written Works',
    //   href: '/authed/upload',
    // },
    // {
    //   text: 'Location',
    //   href: '/authed/location',
    // },
    {
      text: 'Likeness',
      href: '/authed/likeness',
    },
  ]
  let requests = [1, 2, 3]
  let activeMenuRow = $state<number | null>(null)

  function getMenuItems(read: boolean) {
    return read ? notificationsMenuItems.filter((item) => item.action !== 'mark-read') : notificationsMenuItems
  }
  function handleMenuSelect(index: number, action?: string) {
    if (action !== 'mark-read') return
    notifications[index].read = true
  }

  function formatDateWithOrdinal(date: string | Date) {
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

<svelte:head>
  <title>chapter ip</title>
</svelte:head>

<Toast />
<div class="flex min-h-screen flex-col overflow-x-hidden bg-cream text-dark">
  <Header {authStore} {menuItems} pathname={page.url.pathname}>
    <div class="flex h-full items-stretch w-full justify-between md:pl-15 pl-2">
      <div class="flex items-stretch">
        <NavLink href="/authed/files">Dashboard</NavLink>

        <div class="border-l bg-[#464646] my-3"></div>

        <div class="dropdown bg-transparent">
          <div
            tabindex="0"
            role="button"
            class="btn bg-transparent border-0 shadow-none hover:bg-transparent active:bg-transparent flex items-center
             gap-2 text-[15px] font-medium text-[#767682] px-none"
          >
            <span class="hidden md:block">Create and Upload</span>

            <svg class="w-4 h-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <ul
            tabindex="-1"
            class="dropdown-content menu rounded-box z-30 md:w-52 w-35 p-2 rounded-md
            shadow-[3px_6px_8px_0_rgba(21,34,50,0.08)]
            border border-[#1A1A2E1A] top-12
            bg-cream text-sm font-medium text-left text-[#1A1A2E99]"
          >
            {#each browseAndPurchaseItems as item (item)}
              <li><a href={item.href}>{item.text}</a></li>
            {/each}
          </ul>
        </div>
      </div>

      <div class="dropdown bg-transparent md:dropdown-left dropdown-end">
        <div
          tabindex="0"
          role="button"
          class="btn bg-transparent border-0 shadow-none hover:bg-transparent active:bg-transparent flex items-center px-0
          text-[15px] font-medium text-[#767682] px-none"
        >
          <div class="flex items-center md:gap-7.25 gap-4">
            <div class="relative cursor-pointer">
              <img src={BellIcon} alt="notifications" class="h-5.75" />
              {#if requests.length > 0}
                <span class="absolute top-0 -right-1 block w-3 h-3 rounded-full bg-primary border-2 border-[#fef9ee]"
                ></span>
              {/if}
            </div>
            <spam
              class="my-auto flex items-center justify-center rounded-full bg-primary text-white font-semibold w-7 h-7 pt-0.5"
            >
              {publisherStore.title?.slice(0, 1)?.toUpperCase() || 'U'}
            </spam>
          </div>
        </div>

        <ul
          tabindex="-1"
          class="dropdown-content menu rounded-box z-30 md:w-100 w-[90vw] p-3.75 rounded-md shadow-[3px_6px_8px_0_rgba(21,34,50,0.08)]
          border border-[#1A1A2E1A] top-12 bg-cream text-sm font-medium text-left text-[#1A1A2E99]
          md:translate-x-6 max-md:fixed max-md:left-1/2 max-md:-translate-x-1/2 max-md:top-16"
        >
          <div class="flex items-center justify-between">
            <h2 class="text-[13px] font-semibold text-dark">Notifications</h2>

            <button class="text-xs font-medium text-cream rounded-sm bg-primary px-3.75 py-2.5">
              Mark 2 as read
            </button>
          </div>

          <div class="pt-9">
            {#each notifications as tx, i (tx.id)}
              <li>
                <div class="flex items-start leading-0">
                  <div class="size-1.5 rounded-full bg-primary shrink-0 mt-4"></div>
                  <div class="flex flex-col items-between justify-start w-full">
                    <div class="flex items-center justify-between w-full">
                      <p class="text-[13px] font-semibold">
                        {tx.text}
                      </p>
                      <RowActionMenu
                        items={[
                          { text: 'View details', action: 'view-details' },
                          { text: 'Mark as read', action: 'mark-read' },
                        ]}
                        buttonLabel={`Open actions for ${tx.text}`}
                        onOpenChange={(open) => (activeMenuRow = open ? i : null)}
                        onSelect={(item) => handleMenuSelect(i, item.action)}
                      />
                    </div>
                    <span class="text-xs font-medium text-[#1A1A2E99] -mt-1">
                      {formatDateWithOrdinal(tx.date)}
                    </span>
                    {#if i !== notifications.length - 1}
                      <div class="border-t border-[#DDD7D1] mt-3.5"></div>
                    {/if}
                  </div>
                </div>
              </li>
            {/each}
          </div>

          <div class="flex items-center justify-between px-8 py-6 border-t border-[#DDD7D1]">
            <span class="text-[18px] text-[#1A1A2E99] font-medium"> 2 of 2 unread notifications </span>

            <button class="text-[20px] font-semibold text-[#6C3BFF] hover:opacity-80 transition"> View all </button>
          </div>
        </ul>
      </div>
    </div>
  </Header>
  <main class="flex flex-1 flex-col bg-cream px-6 pt-9.75">
    <div class="flex-1">
      {@render children?.()}
    </div>
    <div class="p-8 md:p-12.5">
      <Footer />
    </div>
  </main>
</div>
