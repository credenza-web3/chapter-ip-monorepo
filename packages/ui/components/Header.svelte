<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import Logo from '../assets/ch-logo.svg'
  import Dots from '../assets/dots.svg'

  let { authStore, children } = $props<{ authStore: any; children?: () => any }>()
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
  class="mx-auto w-full flex items-center justify-between md:px-10 px-4 py-4 border-b border-[#eef2f6] bg-[#f9fafb] relative text-black"
>
  <a href="/">
    <img src={Logo} alt="Logo" class="w-30" />
  </a>
  {#if authState.accessToken}
    {@render children?.()}
  {/if}
  <div class="flex items-center gap-6">
    {#if authState.accessToken}
      <button
        class="cursor-pointer"
        onclick={() => {
          menuOpen = !menuOpen
        }}
      >
        <img src={Dots} alt="Menu" class="size-4" />
      </button>
    {/if}
  </div>
  {#if menuOpen}
    <div class="absolute top-full right-3 bg-gray-300 text-white flex flex-col z-50 shadow-lg rounded p-2">
      {#if authState.accessToken}
        <button onclick={() => authStore.logout()} class="btn btn-outline md:btn-md btn-sm md:text-base text-xs"
          >Logout</button
        >
      {:else}
        <button onclick={() => authStore.startLogin()} class="btn btn-outline md:btn-md btn-sm md:text-base text-xs"
          >Login</button
        >
      {/if}
    </div>
  {/if}
</header>
