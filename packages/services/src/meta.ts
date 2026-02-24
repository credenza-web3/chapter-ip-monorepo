import type { ethers } from "@credenza3/evm-provider"

let metaUris: Record<
    string,
    {
      name: string
      size: number
      type: string
      title: string
      image: string
      key: string
      description: string
    }
  > = {}

export const fetchContentTokenMeta = async (contentContract: ethers.Contract, contentTokenId: string) => {
  const metaUri = await contentContract.tokenURI(String(contentTokenId))

  let metadata: typeof metaUris[string] = metaUris[metaUri]

  if (!metaUris[metaUri]) {
    const response = await fetch(metaUri)
    metadata = await response.json()
    metaUris[metaUri] = metadata
  }
  return metadata
}
