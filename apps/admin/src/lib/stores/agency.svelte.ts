import { ethers } from "@repo/fe-evm-provider";

class AgencyStore {
  agencyAddress = $state('')
  agencyFee = $state(0)

  isValidAddress = $derived(
    this.agencyAddress === '' || ethers.isAddress(this.agencyAddress)
  )

  hasValidAddress = $derived(
    this.agencyAddress !== '' && ethers.isAddress(this.agencyAddress)
  )

  setData(data: { agencyAddress: string; agencyFee: number }) {
    this.agencyFee = data.agencyFee
    if (data.agencyAddress === ethers.ZeroAddress) {
      this.agencyAddress = ''
      return
    }
    this.agencyAddress = data.agencyAddress
  }

  reset() {
    this.agencyAddress = ''
    this.agencyFee = 0
  }

  get canSave(): boolean {
    return this.isValidAddress
  }

  getData() {
    return {
      agencyAddress: this.agencyAddress,
      agencyFee: this.agencyFee,
    }
  }
}

export const agencyStore = new AgencyStore()
