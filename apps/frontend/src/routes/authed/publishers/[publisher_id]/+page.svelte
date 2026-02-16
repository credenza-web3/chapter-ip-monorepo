<script lang="ts">
  import { authStore } from '$lib'
  import { ethers, getSigner, initProvider } from '@repo/fe-evm-provider'
  import { abi as content_abi } from '@credenza3/contracts/artifacts/ContentNftContract.json'
  import { abi as license_abi } from '@credenza3/contracts/artifacts/LicenseNftContract.json'
  import { passportStore } from '$lib/passport.store'
  import { forwardTransaction, r2Config } from '@repo/fe-services'
  import { get } from 'svelte/store'
  import { goto } from '$app/navigation'
  import { getTokenMetadata } from '../../purchases/helper.js'

  let { data } = $props()

  let loading = $state(false)

  const CONTENT_CONTRACT = import.meta.env.VITE_EVM_CONTENT_NFT_CONTRACT_ADDRESS
  const LICENSE_CONTRACT = import.meta.env.VITE_EVM_LICENSE_NFT_CONTRACT_ADDRESS

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
    const pass = get(passportStore)
    const licenseName = licenseType === '0' ? 'Fulltime' : 'Onetime'
    const title = `${licenseName} license purchase`

    pass?.openUI('payment', {
      title,

      licenses: [
        {
          contractAddress: CONTENT_CONTRACT,
          licenseContractAddress: LICENSE_CONTRACT,
          licenseType,
          contentTokenId: tokenId,
          amount: 1,
        },
      ],
    })

    pass?.once(
      'PAYMENT',
      async (data: { type: string; results: { items: Array<{ outcome: { voucher: string; sig: string } }> } }) => {
        if (data.type !== 'STRIPE') return goto('/authed/purchases')

        try {
          loading = true
          if (!data.results.items[0].outcome) return
          const { voucher, sig } = data.results.items[0].outcome

          const provider = await initProvider(authStore.state.accessToken!)
          const signer = await getSigner()
          const userAddress = await signer.getAddress()
          const licenseContract = new ethers.Contract(LICENSE_CONTRACT, license_abi, signer)
          const tx = await licenseContract.redeem.populateTransaction(userAddress, voucher, sig)

          const txHash = await forwardTransaction(tx, {
            token: authStore.state.accessToken!,
            client_id: import.meta.env.VITE_CLIENT_ID,
            evm_wss: import.meta.env.VITE_CREDENZA_EVM_WSS,
          })

          const ethersProvider = new ethers.BrowserProvider(provider)
          const receipt = await ethersProvider.waitForTransaction(txHash)
          if (!receipt) throw new Error('Transaction failed')

          goto('/authed/purchases')
        } finally {
          loading = false
        }
      },
    )
  }
</script>

<div class="container mx-auto px-4 py-8">
  <div class="breadcrumbs text-sm mb-6">
    <ul>
      <li><a href="/authed/publishers">Publishers</a></li>
      <li>{data.publisher.title}</li>
    </ul>
  </div>

  {#if loading}
    <div class="flex items-center justify-center h-16">
      <span class="loading loading-dots loading-lg"></span>
    </div>
  {:else}
    <h2 class="text-2xl font-semibold mb-4">Products</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {#if data.contentItems.length === 0}
        <div class="alert">
          <span>No content here yet.</span>
        </div>
      {:else}
        {#each data.contentItems as item}
          <div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow card-sm border border-gray-200">
            {#await getTokenMetadata(authStore.state.accessToken!, item.tokenId) then metadata}
             <object data={metadata.image} type="image/jpeg" title="File" class="w-30 h-30 rounded-lg mx-auto mt-4">
                <img src={r2Config.url + r2Config.defaultImage} alt="File" />
              </object>
            <div class="card-body">
              <h3 class="card-title">{metadata.title || 'UNTITLED'}</h3>
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
                    <div class="flex flex-col w-full gap-1">
                      <div class="flex items-center justify-between w-full">
                        <span>One Time license price:</span>
                        <span class="text-2xl font-bold text-primary">${price.onetime}</span>
                        <button class="btn btn-primary" onclick={() => onBuyLicense(item.tokenId, '2')}>Buy Now</button>
                      </div>
                      <p class="text-xs text-yellow-600 mt-1">
                        Warning: One Time License allows interaction with this content only once.
                      </p>
                    </div>
                  {/if}
                </div>
              {/await}
            </div>
            {/await}
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</div>
