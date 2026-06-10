<script lang="ts">
  import '../app.css'
  import { Toast, Header, Footer } from '@repo/ui-components'
  import { authStore } from '$lib'
  import NavLink from '$lib/components/NavLink.svelte'
  import { publisherStore } from '$lib/stores/publisher.svelte'
  import { page } from '$app/state'
  import BellIcon from '$lib/assets/bell.svg'
  import { headerStore } from '$lib/stores/header.store'

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
        <a href="/authed/notifications" class="inline-flex">
          <div class="relative cursor-pointer">
            <img src={BellIcon} alt="notifications" class="h-5.75" />
            {#if $headerStore.hasNotifications}
              <span class="absolute top-0 -right-1 block w-3 h-3 rounded-full bg-primary border-2 border-[#fef9ee]"
              ></span>
            {/if}
          </div>
        </a>
        <spam class="my-auto flex items-center justify-center rounded-full text-white font-semibold w-7 h-7">
          {#if publisherStore.avatarUrl}
            <img src={publisherStore.avatarUrl} class="object-cover w-full h-full rounded-full" alt="avatar" />
          {:else}
            {publisherStore.title?.slice(0, 1)?.toUpperCase() || 'U'}
          {/if}
        </spam>
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
