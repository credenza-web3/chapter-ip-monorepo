<script lang="ts">
  import { goto } from '$app/navigation'
  import { getMembershipPrice, verifyMembership } from '$lib/membership'
  import { passportStore } from '$lib/passport.store'
  import type { Passport } from '@credenza3/passport-evm'
  import { onMount } from 'svelte'
  import { get } from 'svelte/store'

  let { publisherAddress } = $props()

  let pass: Passport | null = $state(null)
  const purchaseSubscription = async () => {
    const title = `Subscription license for ChapterIP`

    pass?.openUI('payment', {
      title,
      memberships: [
        {
          contractAddress: import.meta.env.VITE_EVM_MEMBERSHIP_CONTRACT_ADDRESS,
          membershipTokenId: String(BigInt(publisherAddress)),
        },
      ],
    })

    pass?.once('PAYMENT', async () => goto('/authed/purchases'))
  }

  let hasMembership = $state(false)
  onMount(async () => {
    pass = get(passportStore)
    const userAddress = await pass?.getAddress()
    hasMembership = await verifyMembership(publisherAddress, userAddress || '')
  })
</script>

{#if !hasMembership}
  {#await getMembershipPrice(publisherAddress) then price}
    <div class="flex items-center w-full justify-between border border-gray-200 p-2 rounded-md my-2">
      <span>Purchase a subscription to have access to all files.</span>
      <button class="btn btn-primary" onclick={purchaseSubscription}>Subscribe for ${price}</button>
    </div>
  {/await}
{:else}
  <div class="flex items-center w-full justify-between border border-green-200 p-2 rounded-md my-2">
    <span>You already have a subscription to this publisher.</span>
  </div>
{/if}
