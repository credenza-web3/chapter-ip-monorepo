<script lang="ts">
  import '../app.css'
  import favicon from '$lib/assets/credenza.png'
  import { Toast, Header, Footer } from '@repo/ui-components'
  import { authStore } from '$lib'
  import DashboardIcon from '$lib/components/icons/DashboardIcon.svelte'
  import UploadIcon from '$lib/components/icons/UploadIcon.svelte'
  import NavLink from '$lib/components/NavLink.svelte'
  import { publisherStore } from '$lib/stores/publisher.svelte'
  import { page } from '$app/state'

  let { children } = $props()
  const menuItems = [
    {
      text: 'History',
      href: '/authed/history',
    },
  ]
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>chapter ip</title>
</svelte:head>
<Toast />
<div class="min-h-screen overflow-x-hidden flex flex-col bg-[#f9fafb] text-[#202225]">
  <Header {authStore} {menuItems} pathname={page.url.pathname}>
    <div class="flex items-center w-full justify-between md:pl-15 pl-5 pr-5 space-x-2">
      <div>
        <NavLink href="/authed/files" icon={DashboardIcon}>Dashboard</NavLink>
      </div>

      <div class="flex items-center gap-4">
        <NavLink href="/authed/upload" icon={UploadIcon}>Upload</NavLink>
        <a
          href="/authed/profile"
          class="flex items-center justify-center rounded-full bg-[#6e4ff7] text-white font-semibold w-7 h-7"
        >
          {publisherStore.title?.slice(0, 1)?.toUpperCase() || 'U'}
        </a>
      </div>
    </div>
  </Header>
  <main class="space-y-0 flex-1 p-6">
    {@render children?.()}
  </main>
  <Footer />
</div>
