import { ethers, initProvider, getSigner } from '@repo/fe-evm-provider'
import { abi as license_abi } from '@credenza3/contracts/artifacts/LicenseNftContract.json'
import { createClient } from '@repo/trpc/client'

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
  let metaUris: Record<
    string,
    {
      name: string
      size: number
      type: string
      title: string
      image: string
      key: string
    }
  > = {}
  for (let i = 0; i < balanceNum; i++) {
    const licenseTokenId = await licenseContract.tokenOfOwnerByIndex(userAddress, i)
    const contentTokenId = (await licenseContract.getTokenLicenseContentNftId(String(licenseTokenId))).toString()
    if (!Number(contentTokenId)) {
      continue
    }
    const licenseType = (await licenseContract.getTokenLicenseType(String(licenseTokenId))).toString()
    const metaUri = await contentContract.tokenURI(String(contentTokenId))

    let metadata: {
      name: string
      size: number
      type: string
      title: string
      image: string
      key: string
    } = metaUris[metaUri]

    if (!metaUris[metaUri]) {
      const response = await fetch(metaUri)
      metadata = await response.json()
      metaUris[metaUri] = metadata
    }

    tokens.push({
      licenseTokenId,
      isBlocked: blockedLicensesIds.includes(String(licenseTokenId)),
      contentTokenId: Number(contentTokenId),
      metadata,
      licenseType,
    })
  }

  return tokens
}

export const getTokenMetadata = async (accessToken: string, tokenId: string) => {
  await initProvider(accessToken)
  const signer = await getSigner()
  const contentContract = new ethers.Contract(
    import.meta.env.VITE_EVM_CONTENT_NFT_CONTRACT_ADDRESS,
    license_abi,
    signer,
  )

  try {
    const metaUri = await contentContract.tokenURI(String(tokenId))
    const response = await fetch(metaUri)
    const metadata: { image: string, title: string } = await response.json()

    return metadata
  } catch (error) {
    console.error('Error fetching metadata:', error)
    return { image: '', title: '' }
  }
}
