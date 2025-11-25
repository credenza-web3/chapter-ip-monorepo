<script lang="ts">
  import { authStore } from '$lib'

  const { state: authState } = $derived(authStore)
</script>

<header class="mx-auto w-full flex items-center justify-between px-10 py-4">
  <!-- Navigation -->
  <div class="flex justify-between items-center gap-12">
    {#if authState.accessToken}
      <button onclick={() => authStore.logout()} class="btn btn-outline">Logout</button>
    {:else}
      <button onclick={() => authStore.startLogin()} class="btn btn-outline">Login</button>
    {/if}
  </div>
</header>
