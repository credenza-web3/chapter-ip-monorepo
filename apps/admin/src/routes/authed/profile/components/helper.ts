export async function fetchUntilFound(
  contract: any,
  userAddress: string,
  fromBlock: number,
  step: number,
  stopSignal: () => boolean,
) {
  let currentBlock = fromBlock
  const filter = contract.filters.Transfer(null, userAddress)

  while (currentBlock > 0) {
    if (stopSignal?.()) break

    const toBlock = currentBlock
    const startBlock = Math.max(toBlock - step, 0)

    try {
      const chunk = await contract.queryFilter(filter, startBlock, toBlock)
      currentBlock = startBlock - 1
      if (chunk?.length > 0) {
        return { foundEvents: chunk, nextBlock: currentBlock }
      }
    } catch (err) {
      console.warn(`queryFilter failed for blocks ${startBlock}-${toBlock}`, err)
      currentBlock = startBlock - 1
    }
  }
  return { foundEvents: [], nextBlock: currentBlock }
}

export function getAmount(args: [string, string, bigint]) {
  if (!args || args.length < 3) return ''
  const value = args[2]
  return typeof value === 'bigint' ? value.toString() : value
}

export const mapLicenseType = (licenseType: bigint | number | string) => {
  if (typeof licenseType === 'bigint') licenseType = Number(licenseType)
  return licenseType === 0 ? 'Fulltime' : 'Onetime'
}
