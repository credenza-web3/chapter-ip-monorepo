<script lang="ts">
import CredenzaLogo from '../assets/credenza.svg'

  let { authStore, menuItems} = $props()
  const { state: authState } = $derived(authStore)
</script>

<header class="mx-auto w-full flex items-center justify-between px-10 py-4">
  <!-- Logo -->
<img src={CredenzaLogo} alt="Credenza Logo">  <nav>
    <ul class="flex space-x-4">
      {#each menuItems as item}
        <li>
          <a href={item.href}>{item.label}</a>
        </li>
      {/each}
    </ul>
  </nav>
  <!-- Navigation -->
  <div>
    {#if authState.accessToken}
      <button onclick={() => authStore.logout()} class="btn btn-outline">Logout</button>
    {:else}
      <button onclick={() => authStore.startLogin()} class="btn btn-outline">Login</button>
    {/if}
  </div>
</header>
