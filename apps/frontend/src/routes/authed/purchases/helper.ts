import { authStore } from '$lib'
import { ethers, initProvider, getSigner } from '@repo/fe-evm-provider'
import { abi as license_abi } from '@credenza3/contracts/artifacts/LicenseNftContract.json'

export const getTokensWithMetadata = async (accessToken: string) => {
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

  for (let i = 0; i < balanceNum; i++) {
    const licenseTokenId = await licenseContract.tokenOfOwnerByIndex(userAddress, i)
    // const contentTokenId = await licenseContract.getTokenLicenseContentNftId(Number(licenseTokenId))

    // const metaUri = await licenseContract.tokenURI(contentTokenId)

    // const response = await fetch(metaUri)
    // const metadata = await response.json()

    tokens.push({
      licenseTokenId: Number(licenseTokenId),
      // contentTokenId: Number(contentTokenId),
      metadata: {
        name: 'image_2025-11-19_08-53-56.png',
        size: 81682,
        type: 'image/png',
        key: '8.png',
      },
    })
  }

  return tokens
}
