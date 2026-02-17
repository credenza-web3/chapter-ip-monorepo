import { ethers } from '@repo/fe-evm-provider'
import { notify, ToastType } from '@repo/ui-components'

export async function savePublisherAgency(
  contentContract: ethers.Contract,
  userAddress: string,
  agencyAddress: string,
): Promise<boolean> {
  try {
    await contentContract.setPublisherAgency(userAddress, agencyAddress)
    notify('Agency settings saved successfully', ToastType.SUCCESS)
    return true
  } catch (error) {
    console.error(error)
    notify('Failed to save agency settings', ToastType.FAIL)
    return false
  }
}
