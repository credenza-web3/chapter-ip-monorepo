<script lang="ts">
  import { passportStore } from '$lib/passport.store'
  import { Passport } from '@credenza3/passport-evm'
  import { onMount } from 'svelte'

  let { children } = $props()

  let isMounted = $state(false)

  onMount(async () => {
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
  })
</script>

{#if isMounted}
  {@render children?.()}
{/if}
