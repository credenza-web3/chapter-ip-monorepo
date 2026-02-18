import { ethers } from "@repo/fe-evm-provider";

class AgencyStore {
  agencyAddress = $state('')
  agencyFee = $state(0)
  originalAddress = $state('')

  isValidAddress = $derived(
    this.agencyAddress === '' || ethers.isAddress(this.agencyAddress)
  )

  hasValidAddress = $derived(
    this.agencyAddress !== '' && ethers.isAddress(this.agencyAddress)
  )

  hasChanged = $derived(
    this.agencyAddress !== this.originalAddress
  )

  setData(data: { agencyAddress: string; agencyFee: number }) {
    this.agencyFee = data.agencyFee
    if (data.agencyAddress === ethers.ZeroAddress) {
      this.agencyAddress = ''
      this.originalAddress = ''
      return
    }
    this.agencyAddress = data.agencyAddress
    this.originalAddress = data.agencyAddress
  }

  reset() {
    this.agencyAddress = ''
    this.originalAddress = ''
    this.agencyFee = 0
  }

  get canSave(): boolean {
    return this.isValidAddress && this.hasChanged
  }

  getData() {
    return {
      agencyAddress: this.agencyAddress,
      agencyFee: this.agencyFee,
    }
  }
}

export const agencyStore = new AgencyStore()
