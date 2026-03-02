import { ethers, initProvider, getSigner } from '@repo/fe-evm-provider'
import { abi as license_abi } from '@credenza3/contracts/artifacts/LicenseNftContract.json'
import { createClient } from '@repo/trpc/client'
import { fetchContentTokenMeta } from '@repo/fe-services'
import { getMemberships } from '$lib/membership'

export const getTokensWithMetadata = async (accessToken: string, trpcClient: ReturnType<typeof createClient>) => {
  await initProvider(accessToken)
  const signer = await getSigner()
  const licenseContract = new ethers.Contract(
    import.meta.env.VITE_EVM_LICENSE_NFT_CONTRACT_ADDRESS,
    license_abi,
    signer,
  )

  const contentContract = new ethers.Contract(
    import.meta.env.VITE_EVM_CONTENT_NFT_CONTRACT_ADDRESS,
    license_abi,
    signer,
  )
  const userAddress = await signer.getAddress()
  const balance = await licenseContract.balanceOf(userAddress)
  const balanceNum = Number(balance)

  const tokens = []
  const { items: blockedLicenses } = await trpcClient.licenses.findBlockedLicenses.query({
    subEvmAddress: userAddress,
  })

  const blockedLicensesIds = blockedLicenses.map((blockedLicense) => blockedLicense.tokenId)

  for (let i = 0; i < balanceNum; i++) {
    const licenseTokenId = await licenseContract.tokenOfOwnerByIndex(userAddress, i)
    const contentTokenId = (await licenseContract.getTokenLicenseContentNftId(String(licenseTokenId))).toString()
    if (!Number(contentTokenId)) {
      continue
    }
    const licenseType = (await licenseContract.getTokenLicenseType(String(licenseTokenId))).toString()

    try {
      let metadata: {
        name: string
        size: number
        type: string
        title: string
        image: string
        key: string
      } = await fetchContentTokenMeta(contentContract, contentTokenId)

      tokens.push({
        licenseTokenId,
        isBlocked: blockedLicensesIds.includes(String(licenseTokenId)),
        contentTokenId: Number(contentTokenId),
        metadata,
        licenseType,
      })
    } catch (error) {
      console.error('Error fetching metadata for token', licenseTokenId, error)
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
  const contentContract = new ethers.Contract(
    import.meta.env.VITE_EVM_CONTENT_NFT_CONTRACT_ADDRESS,
    license_abi,
    signer,
  )
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
        metadata: any
      }>
    }
  > = {}

  const { items: publishers } = await trpcClient.publishers.findPublishers.query({
    limit: '100',
    addresses: publisherAddressesConfirmed,
  })
  for (const publisher of publishers) {
    try {
      // Get content items for this publisher
      const { items: contentItems } = await trpcClient.files.findContent.query({
        sub: publisher.sub,
        contractAddress: import.meta.env.VITE_CONTENT_CONTRACT_ADDRESS,
      })

      // Get tokens and metadata for each content item
      const processedContentItems = []
      for (const item of contentItems) {
        try {
          const metadata = await fetchContentTokenMeta(contentContract, item.tokenId)

          processedContentItems.push({
            contentTokenId: Number(item.tokenId),
            metadata,
          })
        } catch (error) {
          console.error(`Error fetching metadata for token ${item.tokenId}:`, error)
        }
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
