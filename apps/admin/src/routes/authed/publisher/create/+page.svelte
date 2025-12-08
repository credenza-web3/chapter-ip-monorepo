<script lang="ts">
  import { goto } from '$app/navigation'
  import { notify, ToastType } from '@repo/ui-components'

  let publisherName = $state('')
  let loading = $state(false)
  let { data } = $props()

  async function handleSubmit() {
    try {
      loading = true
      await data.trpcClient!.publishers.setPublisher.mutate({
        title: publisherName,
      })

      goto('/authed')
    } catch (error) {
      console.error(error)
      notify('Failed to create publisher', ToastType.FAIL)
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
      <div>
        <label for="publisher-name" class="block text-sm text-gray-700 mb-2"> Publisher Name </label>
        <input
          id="publisher-name"
          type="text"
          bind:value={publisherName}
          placeholder="Enter name"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
          required
        />
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
