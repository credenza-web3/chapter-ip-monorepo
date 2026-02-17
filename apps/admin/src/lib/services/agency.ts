import { ethers } from '@repo/fe-evm-provider'
import { notify, ToastType } from '@repo/ui-components'
import { sendTx } from './transaction'

export async function savePublisherAgency(
  contentContract: ethers.Contract,
  userAddress: string,
  agencyAddress: string,
): Promise<boolean> {
  try {
    const tx = await contentContract.setPublisherAgency.populateTransaction(userAddress, agencyAddress)
    await sendTx(tx)
    notify('Agency settings saved successfully', ToastType.SUCCESS)
    return true
  } catch (error) {
    console.error(error)
    notify('Failed to save agency settings', ToastType.FAIL)
    return false
  }
}
