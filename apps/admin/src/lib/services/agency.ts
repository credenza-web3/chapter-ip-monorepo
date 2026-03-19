import { ethers } from '@repo/fe-evm-provider'
import { notify, ToastType } from '@repo/ui-components'
import { sendTx } from './transaction'
import { agencyStore } from '$lib/stores/agency.svelte'

export async function savePublisherAgencyAddress(
  contentContract: ethers.Contract,
  userAddress: string,
): Promise<boolean> {
  try {
    const agencyAddress = agencyStore.agencyAddress
    const tx = await contentContract.setPublisherAgency.populateTransaction(userAddress, agencyAddress)
    await sendTx(tx)
    notify('Agency address saved successfully', ToastType.SUCCESS)
    return true
  } catch (error) {
    console.error(error)
    notify('Failed to save agency address', ToastType.FAIL)
    return false
  }
}

export async function savePublisherAgencyFee(contentContract: ethers.Contract, userAddress: string): Promise<boolean> {
  try {
    const agencyFee = agencyStore.agencyFee ?? 0
    const tx = await contentContract.setPublisherAgencyFee.populateTransaction(userAddress, agencyFee)
    await sendTx(tx)
    return true
  } catch (error) {
    console.error(error)
    notify('Failed to save agency fee', ToastType.FAIL)
    return false
  }
}
