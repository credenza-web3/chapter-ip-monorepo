import { authStore } from '$lib/auth'
import { configStore, ContractName } from '$lib/stores/config.svelte'
import { getTrpcClient } from '$lib/stores/trpc-client'

export async function findContent(tokenId?: string) {
  const trpcClient = getTrpcClient()
  const subRaw = await authStore.getSubFromToken()
  const sub = subRaw ?? undefined
  for (let i = 0; i < 5; i++) {
    const result = await trpcClient.contents.findContent.query({
      sub,
      contractAddress: configStore.getContractAddress(ContractName.CONTENT_NFT),
      tokenId,
    })
    const item = result.items[0]
    const metadata = item?.metadata as Record<string, unknown> | undefined
    const name = (metadata?.profile as Record<string, unknown> | undefined)?.fullLegalName as string | undefined
    if (name) {
      return { name, type: metadata?.type as string | undefined }
    }
    if (i < 4) await new Promise((r) => setTimeout(r, 2000))
  }
  return undefined
}

export function getTokenId(payload: Record<string, unknown>): string | undefined {
  return (payload.args as string[] | undefined)?.[2]
}
