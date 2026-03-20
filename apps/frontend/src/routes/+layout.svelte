<script lang="ts">
  import '../app.css'
  import favicon from '$lib/assets/credenza.png'
  import { Toast, Header, Footer } from '@repo/ui-components'
  import { authStore } from '$lib'
  import { Modals } from 'svelte-modals'

  let { children } = $props()

  const menuItems = [
    { label: 'Home', href: '/authed/purchases' },
    { label: 'Publishers', href: '/authed/publishers' },
  ]
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>chapter ip</title>
</svelte:head>
<Toast />
<div class="min-h-screen overflow-x-hidden flex flex-col">
  <Header {authStore}>
    <nav>
      <ul class="flex space-x-8">
        {#each menuItems as { label, href }}
          <li>
            <a {href}><span class="text-lg font-semibold">{label}</span></a>
          </li>
        {/each}
      </ul>
    </nav>
  </Header>
  <main class="space-y-0 flex-1 p-6 p-2">
    {@render children?.()}
  </main>
  <Footer />

  <Modals>
    <!-- shown when any modal is opened -->
    {#snippet backdrop({ close })}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <!-- svelte-ignore element_invalid_self_closing_tag -->
      <div class="backdrop" onclick={() => close()} />
    {/snippet}
  </Modals>
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
