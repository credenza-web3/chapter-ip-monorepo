<script lang="ts">
  import { passportStore } from '$lib/passport.store'
  import { Passport } from '@credenza3/passport-evm'
  import { onMount } from 'svelte'
  import { afterNavigate, beforeNavigate } from '$app/navigation'

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
  {#if data.userAddress}
    <span class="text-[10px]">
      <span class="font-semibold text-gray-900">User Address:</span>
      <span class="text-gray-500 ml-1">{data.userAddress}</span>
    </span>
  {/if}
  {@render children?.()}
{/if}
