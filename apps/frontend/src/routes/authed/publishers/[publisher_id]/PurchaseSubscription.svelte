<script lang="ts">
  import { goto } from '$app/navigation'
  import { getMembershipPrice } from '$lib/membership'
  import { passportStore } from '$lib/passport.store'
  import { get } from 'svelte/store'

  let { hasMembership } = $props()

  const purchaseSubscription = async () => {
    const pass = get(passportStore)
    const title = `Subscription license for ChapterIP`

    pass?.openUI('payment', {
      title,
      memberships: [
        {
          contractAddress: import.meta.env.VITE_EVM_MEMBERSHIP_CONTRACT_ADDRESS,
          typeId: '0',
        },
      ],
    })

    pass?.once('PAYMENT', async () => goto('/authed/purchases'))
  }
</script>

{#if !hasMembership}
  {#await getMembershipPrice() then price}
    <div class="flex items-center justify-between w-full">
      <span>Purchase a subscription to have access to all files.</span>
      <span class="text-2xl font-bold text-primary">
        {price}
      </span>
      <button class="btn btn-primary w-[95px]" onclick={purchaseSubscription}>Subscribe</button>
    </div>
  {/await}
{/if}
