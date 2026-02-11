import { authStore } from '$lib'
import { createClient } from '@repo/trpc/client'
import type { PageLoad } from './$types'
import { ethers, getSigner, initProvider } from '@repo/fe-evm-provider'
import { abi as license_abi } from '@credenza3/contracts/artifacts/LicenseNftContract.json'

export const load: PageLoad = async ({ params }) => {
  const fileId = params.fileId

  const trpcClient = createClient({
    trpcUrl: import.meta.env.VITE_TRPC_URL || 'http://localhost:8060/trpc',
    getAccessTokenFn: () => authStore.state.accessToken!,
  })
  const subRaw = await authStore.getSubFromToken()
  const sub = subRaw ?? undefined

  const paginatedResponse = await trpcClient.files.findContent.query({
    sub,
    id: fileId,
  })
  const tokenId = paginatedResponse.items[0].tokenId

  await initProvider(authStore.state.accessToken!)
  const signer = await getSigner()
  const contentContract = new ethers.Contract(
    import.meta.env.VITE_EVM_CONTENT_NFT_CONTRACT_ADDRESS,
    license_abi,
    signer,
  )
  const metaUri = await contentContract.tokenURI(String(tokenId))
  const response = await fetch(metaUri)
  const metadata: { image: string } = await response.json()

  return { paginatedResponse, tokenId, metadata }
}
