<script lang="ts">
  import '../app.css'
  import { Toast, Header, Footer } from '@repo/ui-components'
  import { authStore } from '$lib'
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
  <title>chapter ip</title>
</svelte:head>

<Toast />
<div class="min-h-screen overflow-x-hidden flex flex-col bg-cream text-dark">
  <Header {authStore} {menuItems} pathname={page.url.pathname}>
    <div class="flex items-center w-full justify-between md:pl-15 pl-2 md:pr-5 pr-2 space-x-2">
      <NavLink href="/authed/files">Dashboard</NavLink>
      <div class="flex items-center md:gap-4 gap-2">
        <NavLink href="/authed/upload" icon={UploadIcon}>Upload</NavLink>
        <a
          href="/authed/profile"
          class="flex items-center justify-center rounded-full bg-primary text-white font-semibold w-7 h-7"
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
