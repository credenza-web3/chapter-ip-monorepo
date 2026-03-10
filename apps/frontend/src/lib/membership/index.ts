import { ethers, getSigner, initProvider } from '@repo/fe-evm-provider'
import { abi as membership_abi } from '@credenza3/contracts/artifacts/ChapterIpMembershipContract.json'
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

const verifyMembership = async (publisherAddress: string, subEvmAddress: string) => {
  try {
    const membershipContract = await getMembershipContract()
    if (!membershipContract) return false

    const res = (await membershipContract.confirmMembership(
      ethers.getAddress(publisherAddress),
      ethers.getAddress(subEvmAddress),
    )) as boolean
    return res
  } catch (error) {
    console.error('Error verifying membership:', error)
    return false
  }
}

const getMembershipPrice = async (publisherAddress: string): Promise<number> => {
  const membershipContract = await getMembershipContract()
  if (!membershipContract) return 0

  const price: bigint = await membershipContract.getPriceFiat(BigInt(publisherAddress))
  return Number(price) / 100
}

const normalizeAddress = (address: string) => {
  return ethers.getAddress(address)
}

const getMemberships = async (userAddress: string) => {
  const membershipContract = await getMembershipContract()
  if (!membershipContract) return []

  const memberships = await membershipContract.getMemberships(userAddress)

  const confirmedMemberships: string[] = []

  for (const membership of memberships) {
    try {
      const hasMembership = await membershipContract.confirmMembership(
        normalizeAddress(membership),
        normalizeAddress(userAddress),
      )
      if (hasMembership) {
        confirmedMemberships.push(normalizeAddress(membership))
      }
    } catch (error) {
      console.error(`Error checking membership for ${membership}:`, error)
    }
  }

  return confirmedMemberships
}

export { verifyMembership, getMembershipPrice, normalizeAddress, getMemberships }
