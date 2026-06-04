import type { ethers } from '@credenza3/evm-provider'

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

const BASE_URI = 'https://pub-5c9112f4549643409ad80de98438b4c7.r2.dev'

export const fetchContentTokenMeta = async (contentContract: ethers.Contract, contentTokenId: string) => {
  const metaUri = await contentContract.tokenURI(String(contentTokenId))
  console.log('metaUri', metaUri)
  const fullUri = metaUri.startsWith('http') ? metaUri : `${BASE_URI}/${metaUri}`
  
  let metadata: (typeof metaUris)[string] = metaUris[fullUri]

  if (!metaUris[fullUri]) {
    const response = await fetch(fullUri)
    metadata = await response.json()
    metaUris[fullUri] = metadata
  }
  return metadata
}