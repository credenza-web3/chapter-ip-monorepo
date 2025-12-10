<script lang="ts">
  import { authStore } from '$lib'
  import { ethers, initProvider } from '@repo/fe-evm-provider'
  import { abi as content_abi } from '@credenza3/contracts/artifacts/ContentNftContract.json'
  import { passportStore } from '$lib/passport.store'
  import { get } from 'svelte/store'

  let { data } = $props()
  const CONTENT_CONTRACT = import.meta.env.VITE_EVM_CONTENT_NFT_CONTRACT_ADDRESS

  const getTokenPrice = async (tokenId: string) => {
    const provider = await initProvider(authStore.state.accessToken!)
    const ethersProvider = new ethers.BrowserProvider(provider)

    const contentContract = new ethers.Contract(CONTENT_CONTRACT, content_abi, ethersProvider)

    const priceCentsFulltimeLicense = await contentContract.getLicensePriceFiat(tokenId, '0')
    const priceCentsOnetimeLicense = await contentContract.getLicensePriceFiat(tokenId, '2')
    return {
      fulltime: Number(priceCentsFulltimeLicense) / 100,
      onetime: Number(priceCentsOnetimeLicense) / 100,
    }
  }

  const onBuyLicense = async (tokenId: string, licenseType: string) => {
    const licenseName = licenseType === '0' ? 'Fulltime' : 'Onetime'
    const title = `${licenseName} license purchase`

    get(passportStore)?.openUI('payment', {
      title,
      licenses: [
        {
          contractAddress: CONTENT_CONTRACT,
          licenseType,
          contentTokenId: tokenId,
          amount: 1,
        },
      ],
    })

    // data.passport?.once('payment', (data) => {
    //   console.log('Payment success', data)
    // })
  }
</script>

<div class="container mx-auto px-4 py-8">
  <div class="breadcrumbs text-sm mb-6">
    <ul>
      <li><a href="/authed/publishers">Publishers</a></li>
      <li>{data.publisher.title}</li>
    </ul>
  </div>

  <h2 class="text-2xl font-semibold mb-4">Products</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {#if data.contentItems.length === 0}
      <div class="alert">
        <span>No content here yet.</span>
      </div>
    {:else}
      {#each data.contentItems as item}
        <div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow card-sm border border-gray-200">
          <figure class="px-10 pt-10">
            <div class="avatar placeholder">
              <div class="bg-neutral text-neutral-content rounded-xl w-24">
                <span class="text-3xl">📄</span>
              </div>
            </div>
          </figure>
          <div class="card-body">
            <h3 class="card-title">{item.id}</h3>
            {#await getTokenPrice(item.tokenId) then price}
              <div class="card-actions mt-4 flex flex-col">
                {#if price.fulltime}
                  <div class="flex items-center justify-between w-full">
                    <span>Fulltime license price:</span>
                    <span class="text-2xl font-bold text-primary">${price.fulltime}</span>
                    <button class="btn btn-primary" onclick={() => onBuyLicense(item.tokenId, '0')}>Buy Now</button>
                  </div>
                {/if}
                {#if price.onetime}
                  <div class="flex items-center justify-between w-full">
                    <span>Onetime license price:</span>
                    <span class="text-2xl font-bold text-primary">${price.onetime}</span>
                    <button class="btn btn-primary" onclick={() => onBuyLicense(item.tokenId, '2')}>Buy Now</button>
                  </div>
                {/if}
              </div>
            {/await}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
