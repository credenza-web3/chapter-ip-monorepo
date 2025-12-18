<script lang="ts">
  import LayoutSidebar from './../../../../packages/ui/components/LayoutSidebar.svelte'
  import '../app.css'
  import favicon from '$lib/assets/credenza.png'
  import { Toast, Header, Footer } from '@repo/ui-components'
  import { authStore } from '$lib'
  import { afterNavigate, beforeNavigate } from '$app/navigation'

  let { children } = $props()

  let loading = $state(false)

  const menuItems = [
    { label: 'Dashboard', href: '/authed/files' },
  ]

  beforeNavigate(() => {
    loading = true
  })

  afterNavigate(() => {
    loading = false
  })
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>chapter ip</title>
</svelte:head>
<Toast />
<div class="min-h-screen overflow-x-hidden flex flex-col">
  <LayoutSidebar {menuItems}>
    <Header {authStore} {menuItems} />
    <main class="space-y-0 flex-1 md:p-6 p-2 w-full">
      {#if loading}
        <div class="flex items-center justify-center h-16">
          <span class="loading loading-dots loading-lg"></span>
        </div>
      {:else}
        {@render children?.()}
      {/if}
    </main>
  </LayoutSidebar>
  <Footer />
</div>
