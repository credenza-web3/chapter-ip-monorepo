import { initProvider, getSigner } from '@repo/fe-evm-provider'
import { getMemberships } from '$lib/membership'
import { configStore, ContractName } from '$lib/stores/config.svelte'
import type { createClient } from '@repo/trpc/client'
import type { PurchasedContentToken } from './types'

export const getTokensWithMetadata = async (accessToken: string, trpcClient: ReturnType<typeof createClient>) => {
  await initProvider(accessToken)
  const signer = await getSigner()

  const licenseContract = configStore.getContract(ContractName.LICENSE_NFT, signer)

  const userAddress = await signer.getAddress()
  const balance = await licenseContract.balanceOf(userAddress)
  const balanceNum = Number(balance)

  const { items: blockedLicenses } = await trpcClient.licenses.findBlockedLicenses.query({
    subEvmAddress: userAddress,
  })
  const blockedLicensesIds = blockedLicenses.map((b) => b.tokenId)

  const tokens: PurchasedContentToken[] = []

  for (let i = 0; i < balanceNum; i++) {
    const licenseTokenId = await licenseContract.tokenOfOwnerByIndex(userAddress, i)
    const contentTokenId = await licenseContract.getTokenLicenseContentNftId(String(licenseTokenId))

    if (!Number(contentTokenId)) continue

    const licenseType = await licenseContract.getTokenLicenseType(String(licenseTokenId))

    try {
      const { items } = await trpcClient.contents.findContent.query({
        tokenId: contentTokenId.toString(),
        contractAddress: configStore.getContractAddress(ContractName.CONTENT_NFT),
      })

      const content = items[0]
      if (!content) continue

      const contentWithFiles = await trpcClient.contents.getContentById.query({ id: content.id })
      const contentTokenIdString = contentTokenId.toString()
      const licenseTokenIdString = licenseTokenId.toString()

      tokens.push({
        id: content.id,
        tokenId: contentTokenIdString,
        licenseTokenId: licenseTokenIdString,
        isBlocked: blockedLicensesIds.includes(licenseTokenIdString),
        contentTokenId: Number(contentTokenId),
        sub: content.sub,
        metadata: content.metadata ?? {},
        files: contentWithFiles.files ?? [],
        licenseType: licenseType.toString(),
      })
    } catch (error) {
      console.error('Error fetching content for token', licenseTokenId, error)
    }
  }

  return tokens
}

export const getPurchasedMembershipContent = async (
  accessToken: string,
  trpcClient: ReturnType<typeof createClient>,
) => {
  await initProvider(accessToken)
  const signer = await getSigner()

  const userAddress = await signer.getAddress()
  const publisherAddressesConfirmed: string[] = await getMemberships(userAddress)

  if (publisherAddressesConfirmed.length === 0) {
    return {}
  }

  const groupedContent: Record<
    string,
    {
      publisherId: string
      publisherTitle: string
      publisherSub: string
      contentItems: Array<{
        contentTokenId: number
        metadata: PurchasedContentToken['metadata']
      }>
    }
  > = {}

  const { items: publishers } = await trpcClient.publishers.findPublishers.query({
    limit: '100',
    addresses: publisherAddressesConfirmed,
  })

  for (const publisher of publishers) {
    try {
      const { items: contentItems } = await trpcClient.contents.findContent.query({
        sub: publisher.sub,
        contractAddress: configStore.getContractAddress(ContractName.CONTENT_NFT),
      })
      const processedContentItems = []
      for (const item of contentItems) {
        const contentWithFiles = await trpcClient.contents.getContentById.query({ id: item.id })
        processedContentItems.push({
          contentTokenId: Number(item.tokenId),
          metadata: item.metadata ?? {},
          files: contentWithFiles.files ?? [],
        })
      }
      if (processedContentItems.length > 0) {
        groupedContent[publisher.id] = {
          publisherId: publisher.id,
          publisherTitle: publisher.title,
          publisherSub: publisher.sub,
          contentItems: processedContentItems,
        }
      }
    } catch (error) {
      console.error(`Error fetching content for publisher ${publisher.id}:`, error)
    }
  }

  return groupedContent
}
