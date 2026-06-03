import type { ConfigResponse } from '$lib/types/config'
import { ethers } from '@repo/fe-evm-provider'

function createConfigStore() {
  let data = $state<ConfigResponse | null>(null)
  function getContract(
    contractName: keyof ConfigResponse['contractAddresses'],
    abi: ethers.InterfaceAbi,
    runner: ethers.ContractRunner,
  ) {
    const address = data?.contractAddresses[contractName]

    if (!address) throw new Error(`${contractName} contract address not initialized`)
    return new ethers.Contract(address, abi, runner)
  }

  return {
    get state() {
      return data
    },
    set(config: ConfigResponse) {
      data = config
    },
    getContract,
  }
}
export const configStore = createConfigStore()
