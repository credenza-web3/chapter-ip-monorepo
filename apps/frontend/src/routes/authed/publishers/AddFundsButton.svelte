<script lang="ts">
  import { passportStore } from '$lib/passport.store'
  import { get } from 'svelte/store'
</script>

<div class="flex items-center gap-2">
  <button class="btn btn-ghost border border-gray-200" onclick={() => get(passportStore)?.openUI('wallet')}>Add Funds</button>
  {#await get(passportStore)?.getBalance() then balance}
    <p>Balance: {(Number(balance) / 10**6).toFixed(2)} CRED</p>
  {/await}
</div>