import { browser } from '$app/environment'
import { authStore } from '$lib'
import { ethers, getSigner, initProvider } from '@repo/fe-evm-provider'
import { createClient } from '@repo/trpc/client'
import { abi as content_abi } from '@credenza3/contracts/artifacts/ContentNftContract.json'
import { agencyStore } from '$lib/stores/agency.svelte'
import { goto } from '$app/navigation'

export const prerender = false
export const ssr = false

let authInitialized = false

export const load = async ({ url }) => {
  if (!browser) return {}

  if (!authInitialized) {
    authInitialized = true
    await authStore.init()
  }

  const accessToken = await authStore.getAccessToken()

  if (!accessToken) {
    return goto(`/`)
  }

  const trpcClient = createClient({
    trpcUrl: import.meta.env.VITE_TRPC_URL || 'http://localhost:8060/trpc',
    getAccessTokenFn: () => authStore.state.accessToken!,
  })

  initProvider(accessToken)
  const signer = await getSigner()
  const userAddress = await signer.getAddress()

  const contentContract = new ethers.Contract(
    import.meta.env.VITE_EVM_CONTENT_NFT_CONTRACT_ADDRESS,
    content_abi,
    signer,
  )

  const agencyAddress = await contentContract.publisherAgency(userAddress)
  const agencyFee = await contentContract.publisherAgencyFee(userAddress)

  agencyStore.setAddress(agencyAddress)
  agencyStore.setFee(agencyFee)
  
  const sub = await authStore.getSubFromToken()
  try {
    const publisher = await trpcClient.publishers.getPublisher.query({
      sub: sub!,
    })
    return { trpcClient, publisher, userAddress, contentContract }
  } catch {
    if (url.pathname === '/authed/publisher/create') {
      return { trpcClient, userAddress, contentContract, publisher: null }
    }
    return goto(`/authed/publisher/create`)
  }
}
