<script lang="ts">
  import { authStore } from '$lib'
  import { getTokenPrice } from '../hooks/useTokenPrice'
  import { useLicensePurchase } from '../hooks/useLicensePurchase'
  import { r2Config } from '@repo/fe-services'
  import { onMount } from 'svelte'

  interface Props {
    item: any
  }

  let { item }: Props = $props()
  let price = $state<any>(null)
  let loading = $state(false)

  const { onBuyLicense } = useLicensePurchase()

  onMount(async () => {
    try {
      price = await getTokenPrice(authStore.state.accessToken!, item.tokenId)
    } catch (error) {
      console.error('Error loading content data:', error)
    }
  })
</script>

<div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow card-sm border border-gray-200">
  {#if item.metadata}
    <object data={item.metadata.image} type="image/jpeg" title="File" class="w-full object-contain">
      <img src={r2Config.url + r2Config.defaultImage} alt="File" />
    </object>
    <div class="card-body">
      <h3 class="card-title">{item.metadata.profile.fullLegalName}</h3>
      <h3 class="card-description">{item.metadata.description || ''}</h3>

      {#if price}
        <div class="card-actions mt-4 flex flex-col">
          {#if price.fulltime}
            <div class="flex items-center justify-between w-full">
              <span>Fulltime license price:</span>
              <span class="text-2xl font-bold text-primary">${price.fulltime}</span>
              <button
                class="btn btn-primary"
                onclick={() => onBuyLicense(item.tokenId, '0', item.metadata)}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Buy Now'}
              </button>
            </div>
          {/if}
          {#if price.onetime}
            <div class="flex flex-col w-full gap-1">
              <div class="flex items-center justify-between w-full">
                <span>One Time license price:</span>
                <span class="text-2xl font-bold text-primary">${price.onetime}</span>
                <button
                  class="btn btn-primary"
                  onclick={() => onBuyLicense(item.tokenId, '2', item.metadata)}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Buy Now'}
                </button>
              </div>
              <p class="text-xs text-yellow-600 mt-1">
                Warning: One Time License allows interaction with this content only once.
              </p>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {:else}
    <div class="card-body">
      <div class="flex items-center justify-center h-32">
        <span class="loading loading-dots loading-lg"></span>
      </div>
    </div>
  {/if}
</div>
