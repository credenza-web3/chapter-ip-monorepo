import { ethers } from "@repo/fe-evm-provider";

class AgencyStore {
  agencyAddress = $state('')
  agencyFee = $state(0)
  originalAddress = $state('')
  originalFee = $state(0)

  isValidAddress = $derived(
    this.agencyAddress === '' || ethers.isAddress(this.agencyAddress)
  )

  isFeeValid = $derived(
    this.agencyFee >= 0 && this.agencyFee <= 100
  )

  hasValidAddress = $derived(
    this.agencyAddress !== '' && ethers.isAddress(this.agencyAddress)
  )

  hasAddressChanged = $derived(
    this.agencyAddress !== this.originalAddress
  )

  hasFeeChanged = $derived(
    this.agencyFee !== this.originalFee
  )

  setAddress(address: string) {
    if (address === ethers.ZeroAddress) {
      this.agencyAddress = ''
      this.originalAddress = ''
      return
    }
    this.agencyAddress = address
    this.setOriginalAddress(address)
  }

  setOriginalAddress(address: string) {
    this.originalAddress = address
  }

  setFee(fee: number) {
    this.agencyFee = fee
    this.setOriginalFee(fee)
  }

  setOriginalFee(fee: number) {
    this.originalFee = fee
  }

  reset() {
    this.agencyAddress = ''
    this.originalAddress = ''
    this.agencyFee = 0
  }

  get canSaveAddress(): boolean {
    return (this.isValidAddress && this.hasAddressChanged)
  }

  get canSaveFee(): boolean {
    return this.hasFeeChanged && this.isFeeValid
  }

  getData() {
    return {
      agencyAddress: this.agencyAddress,
      agencyFee: this.agencyFee,
    }
  }
}

export const agencyStore = new AgencyStore()
