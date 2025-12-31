<script lang="ts">
  import { authStore } from '$lib'
  import { ethers, getSigner, initProvider } from '@repo/fe-evm-provider'
  import { abi as content_abi } from '@credenza3/contracts/artifacts/ContentNftContract.json'
  import { abi as license_abi } from '@credenza3/contracts/artifacts/LicenseNftContract.json'
  import { passportStore } from '$lib/passport.store'
  import { forwardTransaction } from '@repo/fe-services'
  import { get } from 'svelte/store'
  import { goto } from '$app/navigation'

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

<div class="relative">
  <img src="https://loremflickr.com/1280/400" alt="Background" />
  <div class="flex gap-6 absolute bottom-[-50px] left-[60px]">
    <img src="https://loremflickr.com/150/150" alt="Background" />
    <h1 class="pt-6 text-4xl text-white" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.7);">{data.publisher.title}</h1>
  </div>
</div>
<div class="container mx-auto px-4 py-8">
  <!-- <div class="breadcrumbs text-sm mb-6">
    <ul>
      <li><a href="/authed/publishers">Publishers</a></li>
      <li>{data.publisher.title}</li>
    </ul>
  </div> -->

  {#if loading}
    <div class="flex items-center justify-center h-16">
      <span class="loading loading-dots loading-lg"></span>
    </div>
  {:else}
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-20 px-10">
      {#if data.contentItems.length === 0}
        <div class="alert">
          <span>No content here yet.</span>
        </div>
      {:else}
        {#each data.contentItems as item}
          <div class="bg-base-100 border border-gray-200 max-w-2xl p-10 pb-2">
            <figure class="pb-6">
              <div class=" flex gap-3">
                <img src="https://loremflickr.com/120/120" alt="Shoes" class="rounded" />
                <div class="text-sm">
                  <h2 class="">title</h2>
                  <span class="text-gray-500"><span class="font-bold">ID: </span>{item.id} </span>
                  <h2 class="font-bold mt-6">Descriptions:</h2>
                  <p>rrrrrrrrrrrr rrrr rrrrr rrrr rrr</p>
                </div>
              </div>
              {#await getTokenPrice(item.tokenId) then price}
                <div class="mt-4 flex gap-2 justify-end">
                  {#if price.fulltime}
                    <div class="flex flex-col gap-1">
                      <button
                        class="btn btn-primary hover:bg-white hover:text-primary hover:border hover:border-primary"
                        onclick={() => onBuyLicense(item.tokenId, '0')}>Buy Now</button
                      >
                      <span class="text-2xl font-bold pl-2"
                        >${price.fulltime}<span class="text-xs text-gray-500">/Fulltime license price</span></span
                      >
                    </div>
                  {/if}
                  {#if price.onetime}
                    <div class="flex flex-col gap-1">
                      <button
                        class="btn btn-primary hover:bg-white hover:text-primary hover:border hover:border-primary"
                        onclick={() => onBuyLicense(item.tokenId, '2')}>Buy Now</button
                      >
                      <span class="text-2xl font-bold pl-2"
                        >${price.onetime}<span class="text-xs text-gray-500">/One Time license price</span></span
                      >
                    </div>
                  {/if}
                </div>
              {/await}
            </figure>
            <p class="text-xs text-yellow-600 mt-1">
              Warning: One Time License allows interaction with this content only once.
            </p>
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</div>
