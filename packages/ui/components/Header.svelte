<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import CredenzaLogo from '../assets/credenza.svg'
  import MenuIconBlack from '../assets/menu_burger_black.svg'

  let { authStore, menuItems } = $props()
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
  class="mx-auto w-full flex items-center justify-between md:px-10 px-4 py-4 border-b border-gray-200 bg-testColor relative"
>
  <a href="/" class="md:hidden block">
    <img src={CredenzaLogo} alt="Credenza Logo" class="md:w-44 w-32" />
  </a>
  {#if authState.accessToken}
    <nav>
      <ul class="hidden md:flex space-x-8">
        {#each menuItems as { label, href }}
          <li>
            <a {href}><span class="text-lg font-semibold">{label}</span></a>
          </li>
        {/each}
      </ul>
    </nav>
  {/if}
  <div class="flex items-center gap-6">
    <div>
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

    {#if authState.accessToken}
      <button
        class="md:hidden cursor-pointer"
        onclick={() => {
          menuOpen = !menuOpen
        }}
      >
        <img src={MenuIconBlack} alt="Menu" class="size-6" />
      </button>
    {/if}
  </div>
  {#if menuOpen}
    <div class="absolute top-full right-3 bg-gray-600 text-white flex flex-col md:hidden z-50 shadow-lg rounded">
      {#each menuItems as { label, href } (label)}
        <a
          {href}
          class="px-6 py-3 border-b last:border-b-0 border-gray-700 hover:text-[#FF00CC]"
          onclick={() => (menuOpen = false)}
        >
          {label}
        </a>
      {/each}
    </div>
  {/if}
</header>
