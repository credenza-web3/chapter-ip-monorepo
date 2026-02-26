import { ethers, getSigner, initProvider } from '@repo/fe-evm-provider'
import { abi as membership_abi } from '@credenza3/contracts/artifacts/SellableMetadataMembershipContract.json'
import { authStore } from '$lib/auth'

let membershipContract: ethers.Contract | null
const getMembershipContract = async (): Promise<ethers.Contract | null> => {
  const accessToken = await authStore.getAccessToken()
  if (!accessToken) return null
  if (membershipContract) return membershipContract

  initProvider(accessToken)
  const signer = await getSigner()

  membershipContract = new ethers.Contract(import.meta.env.VITE_EVM_MEMBERSHIP_CONTRACT_ADDRESS, membership_abi, signer)

  return membershipContract
}

const verifyMembership = async (subEvmAddress: string) => {
  try {
    const membershipContract = await getMembershipContract()
    if (!membershipContract) return false

    const res = (await membershipContract.confirmMembership(subEvmAddress)) as boolean
    return res
  } catch (error) {
    console.error('Error verifying membership:', error)
    return false
  }
}

const getMembershipPrice = async (): Promise<number> => {
  const membershipContract = await getMembershipContract()
  if (!membershipContract) return 0

  const price: bigint = await membershipContract.getPriceFiat('0')
  return Number(price)
}

export { verifyMembership, getMembershipPrice }
