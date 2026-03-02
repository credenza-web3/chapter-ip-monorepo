<script lang="ts">
  import { notify, ToastType } from '@repo/ui-components'
  import type { ModalProps } from 'svelte-modals'
  import PublisherNameInput from '$lib/components/PublisherNameInput.svelte'
  import PublisherAvatarInput from '$lib/components/PublisherAvatarInput.svelte'
  import { savePublisher } from '$lib/services/publisher'
  import ModalWrapper from '$lib/components/ModalWrapper.svelte'
  import { publisherStore } from '$lib/stores/publisher.svelte'

  interface Props extends ModalProps {
    trpcClient: any
  }

  let { isOpen, close, trpcClient }: Props = $props()

  let publisherName = $state(publisherStore.title || '')
  let avatarUrl = $state(publisherStore.avatarUrl || '')
  let loading = $state(false)

  async function handleSubmit() {
    try {
      loading = true
      const result = await savePublisher(trpcClient, publisherName, avatarUrl)

      if (result.success) {
        notify('Publisher updated successfully', ToastType.SUCCESS)
        close()

        publisherStore.setData({
          title: publisherName,
          avatarUrl: avatarUrl,
        })
      }
    } finally {
      loading = false
    }
  }
</script>

<ModalWrapper {isOpen} {close}>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold text-gray-900">Edit Publisher</h2>
      <button onclick={close} class="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close modal">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <form onsubmit={handleSubmit} class="space-y-6">
      <PublisherNameInput bind:value={publisherName} />
      <PublisherAvatarInput bind:value={avatarUrl} />

      <div class="flex gap-3">
        <button
          type="button"
          onclick={close}
          class="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-colors"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={!publisherName || loading}
          class="flex-1 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          {#if loading}
            <div class="loading loading-dots"></div>
          {:else}
            Save Changes
          {/if}
        </button>
      </div>
    </form>
  </div>
</ModalWrapper>
