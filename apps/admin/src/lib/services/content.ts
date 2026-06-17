import { authStore } from '$lib/auth'
import { configStore, ContractName } from '$lib/stores/config.svelte'
import { getTrpcClient } from '$lib/stores/trpc-client'

export async function findContent(tokenId?: string) {
  const trpcClient = getTrpcClient()
  const subRaw = await authStore.getSubFromToken()
  const sub = subRaw ?? undefined
  const result = await trpcClient.contents.findContent.query({
    sub,
    contractAddress: configStore.getContractAddress(ContractName.CONTENT_NFT),
    tokenId,
  })
  return {
    name: result.items[0]?.metadata?.profile?.fullLegalName,
    type: result.items[0]?.metadata?.type,
  }
}

export function getTokenId(payload: Record<string, unknown>): string | undefined {
  return (payload.args as string[] | undefined)?.[2]
}
