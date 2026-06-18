import { authStore } from '$lib/auth'
import { configStore, ContractName } from '$lib/stores/config.svelte'
import { getTrpcClient } from '$lib/stores/trpc-client'
import type { TNotificationItem } from '@repo/notifications'
import { NOTIFICATION_TYPE } from '@repo/notifications'

export async function findContent(tokenId?: string) {
  const trpcClient = getTrpcClient()
  const subRaw = await authStore.getSubFromToken()
  const sub = subRaw ?? undefined
  const result = await trpcClient.contents.findContent.query({
    sub,
    contractAddress: configStore.getContractAddress(ContractName.CONTENT_NFT),
    tokenId,
  })
  const item = result.items[0]
  if (!item?.metadata) return undefined
  const metadata = item.metadata as Record<string, unknown>
  return {
    name: (metadata?.profile as Record<string, unknown> | undefined)?.fullLegalName as string | undefined,
    type: metadata?.type as string | undefined,
  }
}

export function getTokenId(notification: TNotificationItem): string | undefined {
  let index = 1
  if (notification.type === NOTIFICATION_TYPE.CONTENT_CREATED) index = 2
  return (notification.payload.args as string[] | undefined)?.[index]
}
