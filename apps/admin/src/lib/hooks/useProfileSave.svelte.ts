import { notify, ToastType } from '@repo/ui-components'
import { publisherStore } from '$lib/stores/publisher.svelte'
import { agencyStore } from '$lib/stores/agency.svelte.js'
import { savePublisher } from '$lib/services/publisher'
import { savePublisherAgencyAddress, savePublisherAgencyFee } from '$lib/services/agency'
import { ethers, getSigner } from '@repo/fe-evm-provider'
import { abi as membership_abi } from '@credenza3/contracts/artifacts/ChapterIpMembershipContract.json'
import { authStore } from '$lib/auth'
import { forwardTransaction } from '@repo/fe-services'

const FIAT_PRICE_MULTIPLIER = 100
const TOKEN_PRICE_MULTIPLIER = 10 ** 6

interface ProfileData {
  publisherName: string
  avatarUrl: string
  subscriptionPrice: number
}

interface SaveResult {
  success: boolean
  error?: string
}
export function useProfileSave(trpcClient: any, contentContract: ethers.Contract, userAddress: string) {
  let loading = $state(false)

  // Profile data state
  let profileData = $state<ProfileData>({
    publisherName: publisherStore.title || '',
    avatarUrl: publisherStore.avatarUrl || '',
    subscriptionPrice: 0,
  })

  // Original values for change detection
  let originalData = $state<ProfileData>({
    publisherName: publisherStore.title || '',
    avatarUrl: publisherStore.avatarUrl || '',
    subscriptionPrice: 0,
  })

  async function saveSubscriptionPrice(price: number): Promise<void> {
    if (price <= 0) {
      throw new Error('Subscription price must be greater than 0')
    }

    const signer = await getSigner()
    const contract = new ethers.Contract(import.meta.env.VITE_EVM_MEMBERSHIP_CONTRACT_ADDRESS, membership_abi, signer)

    const tokenId = BigInt(ethers.getAddress(publisherStore.evmAddress))

    const [setPriceFiatTx, setPriceTokenTx] = await Promise.all([
      contract.setPriceFiat.populateTransaction(tokenId, price * FIAT_PRICE_MULTIPLIER),
      contract.setPriceToken.populateTransaction(tokenId, price * TOKEN_PRICE_MULTIPLIER),
    ])

    const fwtOpts = {
      token: authStore.state.accessToken!,
      client_id: import.meta.env.VITE_CLIENT_ID,
      evm_wss: import.meta.env.VITE_CREDENZA_EVM_WSS,
    }

    const [fiatHash, tokenHash] = await Promise.all([
      forwardTransaction(setPriceFiatTx, fwtOpts),
      forwardTransaction(setPriceTokenTx, fwtOpts),
    ])

    // Wait for transactions to be mined
    await Promise.all([signer.provider?.waitForTransaction(fiatHash), signer.provider?.waitForTransaction(tokenHash)])
  }

  // Check if any fields have changed
  let hasChanges = $derived(
    profileData.publisherName !== originalData.publisherName ||
      profileData.avatarUrl !== originalData.avatarUrl ||
      profileData.subscriptionPrice !== originalData.subscriptionPrice ||
      agencyStore.hasAddressChanged ||
      agencyStore.hasFeeChanged,
  )

  // Update functions for child components
  function updatePublisherData(name: string, avatar: string): void {
    profileData.publisherName = name
    profileData.avatarUrl = avatar
  }

  function updateSubscriptionPrice(price: number): void {
    profileData.subscriptionPrice = price
    if (originalData.subscriptionPrice === 0) {
      originalData.subscriptionPrice = price
    }
  }

  async function handleSaveAll(): Promise<void> {
    if (!hasChanges || loading) return

    loading = true

    try {
      const savePromises: Promise<SaveResult>[] = []

      // Save publisher info if changed
      if (
        profileData.publisherName !== originalData.publisherName ||
        profileData.avatarUrl !== originalData.avatarUrl
      ) {
        const publisherPromise = savePublisher(trpcClient, profileData.publisherName, profileData.avatarUrl)
        savePromises.push(
          publisherPromise.then((result: any) => {
            if (result.success) {
              publisherStore.setData({
                title: profileData.publisherName,
                avatarUrl: profileData.avatarUrl,
              })
              originalData.publisherName = profileData.publisherName
              originalData.avatarUrl = profileData.avatarUrl
            }
            return result as SaveResult
          }),
        )
      }

      // Save agency address if changed
      if (agencyStore.hasAddressChanged && contentContract) {
        const addressPromise = savePublisherAgencyAddress(contentContract, userAddress)
        savePromises.push(
          addressPromise
            .then(() => {
              agencyStore.setOriginalAddress(agencyStore.agencyAddress)
              return { success: true }
            })
            .catch((error: unknown) => ({
              success: false,
              error: error instanceof Error ? error.message : String(error),
            })),
        )
      }

      // Save agency fee if changed
      if (agencyStore.hasFeeChanged && contentContract) {
        const feePromise = savePublisherAgencyFee(contentContract, userAddress)
        savePromises.push(
          feePromise
            .then(() => {
              agencyStore.setOriginalFee(agencyStore.agencyFee)
              return { success: true }
            })
            .catch((error: unknown) => ({
              success: false,
              error: error instanceof Error ? error.message : String(error),
            })),
        )
      }

      // Save subscription price if changed
      if (profileData.subscriptionPrice !== originalData.subscriptionPrice) {
        const pricePromise = saveSubscriptionPrice(profileData.subscriptionPrice)
        savePromises.push(
          pricePromise
            .then(() => {
              originalData.subscriptionPrice = profileData.subscriptionPrice
              return { success: true }
            })
            .catch((error: unknown) => ({
              success: false,
              error: error instanceof Error ? error.message : String(error),
            })),
        )
      }

      const results = await Promise.all(savePromises)

      // Check if any operations failed
      const failures = results.filter((result) => !result.success)
      if (failures.length > 0) {
        const errorMessages = failures
          .map((f) => f.error)
          .filter(Boolean)
          .join('; ')
        throw new Error(`Some operations failed: ${errorMessages}`)
      }

      notify('All changes saved successfully!', ToastType.SUCCESS)
    } catch (error) {
      console.error('Error saving changes:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      notify(`Error saving changes: ${errorMessage}`, ToastType.FAIL)
      throw error
    } finally {
      loading = false
    }
  }

  return {
    get loading() {
      return loading
    },
    get hasChanges() {
      return hasChanges
    },
    updatePublisherData,
    updateSubscriptionPrice,
    handleSaveAll,
  }
}
