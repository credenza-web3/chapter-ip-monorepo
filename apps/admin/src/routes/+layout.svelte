<script lang="ts">
  import '../app.css'
  import { Toast, Header, Footer } from '@repo/ui-components'
  import { authStore } from '$lib'
  import NavLink from '$lib/components/NavLink.svelte'
  import { publisherStore } from '$lib/stores/publisher.svelte'
  import { page } from '$app/state'
  import BellIcon from '$lib/assets/bell.svg'

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
    {
      text: 'Billing',
      href: '/authed/billing',
    },
  ]

  const BrowseAndPurchaseItems = [
    {
      text: 'Written Works',
      href: '/authed/upload',
    },
    {
      text: 'Location',
      href: '/authed/location',
    },
    {
      text: 'Likeness',
      href: '/authed/likeness',
    },
  ]
  let requests = [1, 2, 3]
</script>

<svelte:head>
  <title>chapter ip</title>
</svelte:head>

<Toast />
<div class="min-h-screen overflow-x-hidden flex flex-col bg-cream text-dark">
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
            <span class="hidden md:block">Browse and Purchase</span>

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
            class="dropdown-content menu rounded-box z-1 md:w-52 w-35 p-2 rounded-md
            shadow-[3px_6px_8px_0_rgba(21,34,50,0.08)]
            border border-[#1A1A2E1A] top-12
            bg-cream text-sm font-medium text-left text-[#1A1A2E99]"
          >
            {#each BrowseAndPurchaseItems as item (item)}
              <li><a href={item.href}>{item.text}</a></li>
            {/each}
          </ul>
        </div>
      </div>
      <div class="flex items-center md:gap-7.25 gap-4">
        <a href="/authed/files" class="inline-flex">
          <div class="relative cursor-pointer">
            <img src={BellIcon} alt="notifications" class="h-5.75" />
            {#if requests.length > 0}
              <span class="absolute top-0 -right-1 block w-3 h-3 rounded-full bg-primary border-2 border-[#fef9ee]"
              ></span>
            {/if}
          </div>
        </a>
        <spam class="my-auto flex items-center justify-center rounded-full bg-primary text-white font-semibold w-7 h-7">
          {publisherStore.title?.slice(0, 1)?.toUpperCase() || 'U'}
        </spam>
      </div>
    </div>
  </Header>
  <main class="space-y-0 flex-1 p-6 pt-9.75 bg-cream">
    {@render children?.()}
  </main>
  <Footer />
</div>
