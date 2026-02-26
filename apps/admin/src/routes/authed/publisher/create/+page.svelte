<script lang="ts">
  import { goto } from '$app/navigation'
  import AgencyAddressInput from '$lib/components/AgencyAddressInput.svelte'
  import { agencyStore } from '$lib/stores/agency.svelte.js'
  import { savePublisherAgencyAddress, savePublisherAgencyFee } from '$lib/services/agency'
  import AgencyFeeInput from '$lib/components/AgencyFeeInput.svelte'
  import PublisherNameInput from '$lib/components/PublisherNameInput.svelte'
  import PublisherAvatarInput from '$lib/components/PublisherAvatarInput.svelte'
  import { savePublisher } from '$lib/services/publisher'
  import { onMount } from 'svelte'
  import { publisherStore } from '$lib/stores/publisher.svelte.js'

  let publisherName = $state('')
  let avatarUrl = $state('')
  let loading = $state(false)
  let { data } = $props()

  onMount(() => {
    if (publisherStore.title) {
      return goto('/authed/profile')
    }
  })

  async function saveAgencyAddress() {
    if (!data.contentContract || !agencyStore.canSaveAddress) return
    await savePublisherAgencyAddress(data.contentContract, data.userAddress)
  }

  async function saveAgencyFee() {
    if (!data.contentContract || !agencyStore.canSaveFee) return
    await savePublisherAgencyFee(data.contentContract, data.userAddress)
  }

  async function handleSubmit() {
    try {
      loading = true
      const result = await savePublisher(data.trpcClient!, publisherName, avatarUrl)

      if (!result.success) {
        return
      }

      await saveAgencyAddress()
      await saveAgencyFee()

      goto('/authed/upload')
    } finally {
      loading = false
    }
  }
</script>

<div class="min-h-xl flex items-center justify-center bg-white p-4">
  <div class="w-full max-w-md">
    <div class="mb-12 text-center">
      <h1 class="text-4xl font-light text-gray-900 mb-3">Create Publisher</h1>
      <p class="text-gray-500 text-sm">Set up your publisher account to continue</p>
    </div>

    <form onsubmit={handleSubmit} class="space-y-6">
      <PublisherNameInput bind:value={publisherName} />
      <PublisherAvatarInput bind:value={avatarUrl} />

      <div class="flex-1 max-w-md">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Agency Settings</h2>

        <div class="flex gap-2 mt-4">
          <AgencyAddressInput />

          <AgencyFeeInput />
        </div>
      </div>

      <button
        type="button"
        disabled={!publisherName || loading}
        onclick={handleSubmit}
        class="w-full py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
      >
        {#if loading}
          <div class="loading loading-dots"></div>
        {:else}
          Create
        {/if}
      </button>
    </form>
  </div>
</div>
