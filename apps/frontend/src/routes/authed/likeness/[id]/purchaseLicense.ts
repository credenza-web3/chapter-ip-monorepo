import { goto } from '$app/navigation'
import { authStore } from '$lib'
import { passportStore } from '$lib/passport.store'
import { configStore, ContractName } from '$lib/stores/config.svelte'
import { Passport } from '@credenza3/passport-evm'
import { ethers, initProvider } from '@repo/fe-evm-provider'
import { forwardTransaction } from '@repo/fe-services'
import { get } from 'svelte/store'
import type { LikenessDetails, LikenessLicense } from '@repo/content-types/likeness'

type PurchaseLicenseType = '0' | '2'

type PurchaseLicenseInput = {
  purchase: LikenessDetails
  license: LikenessLicense
}

type PassportPaymentEvent = {
  type: string
  data?: { hash?: string }
  results?: {
    hash?: string
    items?: Array<{
      tx?: string
      hash?: string
      outcome?: {
        voucher: string
        sig: string
      }
    }>
  }
}

type PurchaseContext = {
  passport: Passport
  accessToken: string
  purchase: LikenessDetails
  license: LikenessLicense
  licenseType: PurchaseLicenseType
  contentTokenId: string
  contentContract: string
  licenseContractAddress: string
}

export type PassportPayment = { kind: 'card'; voucher: string; sig: string } | { kind: 'direct'; hash: string }

const LICENSE_TYPES: Partial<Record<string, PurchaseLicenseType>> = {
  perpetual: '0',
  'single-use': '2',
}

export function getPurchaseLicenseType(licenseId: string): PurchaseLicenseType | null {
  return LICENSE_TYPES[licenseId] ?? null
}

export function canPurchaseLicense(purchase: LikenessDetails, license: LikenessLicense | undefined): boolean {
  return Boolean(license && getPurchaseLicenseType(license.id) && purchase.contentTokenId?.trim())
}

export async function purchaseLicense({ purchase, license }: PurchaseLicenseInput): Promise<void> {
  const context = await getPurchaseContext({ purchase, license })
  const payload = await requestPassportPayment(context)
  const payment = parsePassportPayment(payload)
  const hash = payment.kind === 'card' ? await redeemVoucher(payment, context) : payment.hash

  context.passport.once(Passport.events.ERROR, (error: unknown) => {
    throw error
  })
  await goto('/authed/purchases')
  await openPurchaseAlert(context.passport, hash)
}

export function parsePassportPayment(payload: PassportPaymentEvent): PassportPayment {
  const type = payload.type.toUpperCase()
  const firstItem = payload.results?.items?.[0]

  if (type === 'CARD' || type === 'STRIPE') {
    const { voucher, sig } = firstItem?.outcome ?? {}
    if (!voucher || !sig) throw new Error('Missing card payment voucher outcome')
    return { kind: 'card', voucher, sig }
  }

  const hash = payload.data?.hash || payload.results?.hash || firstItem?.tx || firstItem?.hash

  if (!hash) throw new Error('Missing payment transaction hash')
  return { kind: 'direct', hash }
}

async function getPurchaseContext({ purchase, license }: PurchaseLicenseInput): Promise<PurchaseContext> {
  const passport = get(passportStore)
  if (!passport) throw new Error('Passport is not initialized')

  const accessToken = await authStore.getAccessToken()
  if (!accessToken) throw new Error('Missing auth access token for license purchase')

  const licenseType = getPurchaseLicenseType(license.id)
  if (!licenseType) throw new Error(`Unsupported license type: ${license.id}`)

  const contentTokenId = purchase.contentTokenId?.trim()
  if (!contentTokenId) throw new Error('Missing content token ID for license purchase')

  return {
    passport,
    accessToken,
    purchase,
    license,
    licenseType,
    contentTokenId,
    contentContract: configStore.getContractAddress(ContractName.CONTENT_NFT),
    licenseContractAddress: configStore.getContractAddress(ContractName.LICENSE_NFT),
  }
}

async function requestPassportPayment(context: PurchaseContext): Promise<PassportPaymentEvent> {
  const paymentEvent = new Promise<PassportPaymentEvent>((resolve) => {
    context.passport.once(Passport.events.PAYMENT, resolve)
  })

  await context.passport.openUI(Passport.pages.PAYMENT, {
    title: `Buy ${context.license.name}`,
    subtitle: context.purchase.name,
    licenses: [
      {
        contractAddress: context.contentContract,
        licenseContractAddress: context.licenseContractAddress,
        licenseType: context.licenseType,
        contentTokenId: context.contentTokenId,
        amount: 1,
      },
    ],
  })

  return paymentEvent
}

async function redeemVoucher(payment: { voucher: string; sig: string }, context: PurchaseContext): Promise<string> {
  const provider = await initProvider(context.accessToken)
  const ethersProvider = new ethers.BrowserProvider(provider)
  const signer = await ethersProvider.getSigner()
  const userAddress = await signer.getAddress()
  const licenseContract = configStore.getContract(ContractName.LICENSE_NFT, signer)
  const populatedTx = await licenseContract.redeem.populateTransaction(userAddress, payment.voucher, payment.sig)

  const hash = await forwardTransaction(populatedTx, {
    token: context.accessToken,
    client_id: import.meta.env.VITE_CLIENT_ID,
    evm_wss: import.meta.env.VITE_CREDENZA_EVM_WSS,
  })

  const receipt = await ethersProvider.waitForTransaction(hash)
  if (!receipt) throw new Error('License redemption transaction failed')

  return hash
}

async function openPurchaseAlert(passport: Passport, hash: string): Promise<void> {
  await passport.openUI(Passport.pages.RICH_ALERT, {
    richAlertData: {
      title: 'License Purchased',
      description: 'Your license is available in purchases.',
      action: {
        text: 'View Transaction',
        onClick: () => {
          window.open(`https://testnet.snowtrace.io/tx/${hash}`, '_blank')
          passport.close()
        },
      },
      closeButtonText: 'Close',
    },
  })
}
