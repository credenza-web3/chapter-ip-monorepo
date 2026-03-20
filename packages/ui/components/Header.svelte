<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import Logo from '../assets/ch-logo-light.png'
  import Dots from '../assets/dots.svg'

  let { authStore, children, menuItems, pathname } = $props<{
    authStore: any
    children?: () => any
    menuItems?: { text: string; href: string }[]
    pathname?: string
  }>()
  const { state: authState } = $derived(authStore)
  let menuOpen = $state(false)
  let headerRef: HTMLElement

  function handleClickOutside(event: MouseEvent) {
    if (menuOpen && headerRef && !headerRef.contains(event.target as Node)) {
      menuOpen = false
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside)
  })

  onDestroy(() => {
    document.removeEventListener('click', handleClickOutside)
  })
</script>

<header
  bind:this={headerRef}
  class="mx-auto w-full flex items-center justify-between md:px-10 md:px-4 px-4 py-4 border-b border-[#eef2f6] bg-[#f9fafb] relative text-black"
>
  <a href="/" class="flex-shrink-0">
    <img src={Logo} alt="Logo" class="h-[32px]" />
  </a>
  {#if authState.accessToken}
    {@render children?.()}
  {/if}
  <div class="flex items-center gap-6">
    <button
      class="cursor-pointer"
      onclick={() => {
        menuOpen = !menuOpen
      }}
    >
      <img src={Dots} alt="Menu" class="size-6" />
    </button>
  </div>
  {#if menuOpen}
    <div
      class="absolute top-full right-3 mt-2 w-60 bg-white flex flex-col z-50 shadow-xl rounded-xl border border-[#e5e5e5] py-2"
    >
      {#if authState.accessToken}
        {#each menuItems as item}
          <a
            href={item.href}
            class="px-4 py-2.5 text-sm font-medium rounded-md mx-2 transition-all
            hover:bg-[#f3f4f6] hover:text-[#6e4ff7]
            {pathname === item.href ? 'text-[#6e4ff7] underline underline-offset-4 font-semibold' : ''}"
          >
            {item.text}
          </a>
        {/each}
        {#if menuItems?.length}
          <hr class="my-2 border-[#eeeeee]" />
        {/if}
        <button
          onclick={() => authStore.logout()}
          class="text-left px-4 py-2.5 text-sm font-medium rounded-md mx-2 transition-all hover:bg-red-50 hover:text-red-600"
        >
          Logout
        </button>
      {:else}
        <button
          onclick={() => authStore.startLogin()}
          class="mx-2 mt-1 px-4 py-2.5 text-sm font-semibold text-white bg-[#6e4ff7] rounded-md transition-all hover:bg-[#5b3ff0]"
        >
          Login
        </button>
      {/if}
    </div>
  {/if}
</header>
