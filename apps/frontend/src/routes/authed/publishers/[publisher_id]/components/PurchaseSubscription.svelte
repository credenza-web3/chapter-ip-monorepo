<script lang="ts">
  import { goto } from '$app/navigation'
  import { getMembershipPrice } from '$lib/membership'
  import { passportStore } from '$lib/passport.store'
  import { get } from 'svelte/store'

  let { hasMembership, publisherAddress } = $props()

  const purchaseSubscription = async () => {
    const pass = get(passportStore)
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
</script>

{#if !hasMembership}
  {#await getMembershipPrice() then price}
    <div class="flex items-center w-full justify-between border border-gray-200 p-2 rounded-md my-2">
      <span>Purchase a subscription to have access to all files.</span>
      <button class="btn btn-primary" onclick={purchaseSubscription}>Subscribe for ${price}</button>
    </div>
  {/await}
{/if}
