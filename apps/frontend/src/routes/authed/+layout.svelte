<script lang="ts">
  import { passportStore } from '$lib/passport.store'
  import { Passport } from '@credenza3/passport-evm'
  import { onMount } from 'svelte'
  import { afterNavigate, beforeNavigate } from '$app/navigation'
  import { page } from '$app/state'

  let { children, data } = $props()
  let isMounted = $state(false)
  let loading = $state(false)

  beforeNavigate(() => {
    loading = true
  })

  afterNavigate(() => {
    loading = false
  })

  onMount(async () => {
    loading = true
    const passport = new Passport({
      chainId: '43113',
      clientId: import.meta.env.VITE_CLIENT_ID,
      // provider: window.ethereum,
      config: {
        receiptTarget: ['phone', 'email'],
        content: {
          cloak: false,
        },
      },
    })
    await passport.init()
    passportStore.set(passport)
    isMounted = true
    loading = false
  })
</script>

{#if loading}
  <div class="flex items-center justify-center h-16">
    <span class="loading loading-dots loading-lg"></span>
  </div>
{:else if isMounted}
  {#if !page.url.pathname.startsWith('/authed/publishers/')}
    <div class="text-[10px] flex flex-col md:flex-row md:justify-start items-center mb-4 mr-2">
      <span class="font-semibold text-gray-900">User Address:</span>
      <span class="text-gray-500 ml-1">{data.userAddress}</span>
    </div>
  {/if}
  {@render children?.()}
{/if}
