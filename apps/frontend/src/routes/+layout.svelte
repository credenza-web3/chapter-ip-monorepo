<script lang="ts">
  import LayoutSidebar from './../../../../packages/ui/components/LayoutSidebar.svelte'
  import '../app.css'
  import favicon from '$lib/assets/credenza.png'
  import { Toast, Header, Footer } from '@repo/ui-components'
  import { authStore } from '$lib'
  import { afterNavigate, beforeNavigate } from '$app/navigation'
  import { Modals } from 'svelte-modals'
  import { page } from '$app/state'

  let { children } = $props()

  let loading = $state(false)
  const menuItems = [
    { label: 'Dashboard', href: '/authed/purchases' },
    { label: 'Publishers', href: '/authed/publishers' },
    { label: 'Products', href: '/authed/purchases' },
  ]
  const isAuthenticated = $derived(authStore.state?.accessToken)

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
<Modals>
  {#snippet backdrop({ close })}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore element_invalid_self_closing_tag -->
    <div class="backdrop" onclick={() => close()} />
  {/snippet}
</Modals>

<div class="min-h-screen overflow-x-hidden flex flex-col">
  {#if isAuthenticated}
    <LayoutSidebar {menuItems}>
      <Header {authStore} />
      <main
        class={`space-y-0 flex-1 w-full ${page.url.pathname.startsWith('/authed/publishers/') ? 'p-0' : 'p-2 md:p-6'}`}
      >
        {#if loading}
          <div class="flex items-center justify-center h-16">
            <span class="loading loading-dots loading-lg"></span>
          </div>
        {:else}
          {@render children?.()}
        {/if}
      </main>
    </LayoutSidebar>
  {:else}
    <Header {authStore} />
    <main class="space-y-0 flex-1 md:p-6 p-2 w-full">
      {#if loading}
        <div class="flex items-center justify-center h-16">
          <span class="loading loading-dots loading-lg"></span>
        </div>
      {:else}
        {@render children?.()}
      {/if}
    </main>
  {/if}
  <Footer />
</div>

<style>
  .backdrop {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.5);
  }
</style>
