<script lang="ts">
  import '../app.css'
  import { Toast, Header, Footer } from '@repo/ui-components'
  import { authStore } from '$lib'
  import HeaderSearch from '$lib/components/HeaderSearch.svelte'
  import { Modals } from 'svelte-modals'
  import { page } from '$app/state'

  let { children } = $props()

  const navItems = [
    { label: 'Creative Works', disabled: true },
    { label: 'Location', disabled: true },
    { label: 'Likeness', href: '/authed/likeness' },
    { label: 'Purchases', href: '/authed/purchases' },
  ]

  const searchTargets = [
    { label: 'Creative Works', disabled: true },
    { label: 'Location', disabled: true },
    { label: 'Likeness', href: '/authed/likeness' },
  ]
</script>

<svelte:head>
  <title>chapter ip</title>
</svelte:head>
<Toast />
<div class="min-h-screen overflow-x-hidden flex flex-col">
  <Header {authStore} logoHref="/authed">
    <div class="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
      <nav aria-label="Content dashboards" class="shrink-0">
        <ul class="flex flex-wrap items-start gap-x-2 text-sm font-semibold text-[#8b8790] sm:text-base">
          {#each navItems as item, index (item.label)}
            <li class="flex items-center gap-x-2">
              {#if item.href && !item.disabled}
                <a
                  href={item.href}
                  class:text-primary={page.url.pathname === item.href || page.url.pathname.startsWith(`${item.href}/`)}
                  class="transition-colors hover:text-primary"
                >
                  {item.label}
                </a>
              {:else}
                <span class="cursor-not-allowed opacity-55" aria-disabled="true">{item.label}</span>
              {/if}

              {#if index < navItems.length - 1}
                <span class="text-[#6f6b75]" aria-hidden="true">|</span>
              {/if}
            </li>
          {/each}
        </ul>
      </nav>

      <div class="w-full lg:ml-auto lg:max-w-[360px]">
        <HeaderSearch query={page.url.searchParams.get('q') ?? ''} targets={searchTargets} />
      </div>
    </div>
  </Header>
  <main class="space-y-0 flex-1 md:p-6 p-2 mb-20">
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
