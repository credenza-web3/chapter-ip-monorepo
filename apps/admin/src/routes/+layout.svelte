<script lang="ts">
  import '../app.css'
  import { Toast, Header, Footer } from '@repo/ui-components'
  import { authStore } from '$lib'
  import NavLink from '$lib/components/NavLink.svelte'
  import NotificationsDropdown from '$lib/components/NotificationsDropdown.svelte'
  import { page } from '$app/state'

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

      <NotificationsDropdown />
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
