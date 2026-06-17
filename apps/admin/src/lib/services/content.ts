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
  const metadata = result.items[0]?.metadata as Record<string, unknown> | undefined
  return {
    name: (metadata?.profile as Record<string, unknown> | undefined)?.fullLegalName as string | undefined,
    type: metadata?.type as string | undefined,
  }
}

export function getTokenId(payload: Record<string, unknown>): string | undefined {
  return (payload.args as string[] | undefined)?.[2]
}
