<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import CredenzaLogo from '../assets/credenza.svg'

  let { authStore } = $props()
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

  {#if !authState.accessToken}
    <a href="/">
      <img src={CredenzaLogo} alt="Credenza Logo" class="md:w-44 w-32" />
    </a>
  {:else}
    <a href="/authed/publishers" class="md:hidden block">
      <img src={CredenzaLogo} alt="Credenza Logo" class="md:w-44 w-32" />
    </a>
  {/if}
  {#if authState.accessToken}
    <button onclick={() => authStore.logout()} class="btn btn-outline md:btn-md btn-sm md:text-base text-xs md:ml-auto" 
      >Logout</button
    >
  {:else}
    <button onclick={() => authStore.startLogin()} class="btn btn-outline md:btn-md btn-sm md:text-base text-xs"
      >Login</button
    >
  {/if}
</header>
