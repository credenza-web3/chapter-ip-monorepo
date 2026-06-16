import { goto } from '$app/navigation'
import { authStore } from '$lib'
import { configStore, ContractName } from '$lib/stores/config.svelte'
import { ethers, initProvider } from '@repo/fe-evm-provider'
import { forwardTransaction } from '@repo/fe-services'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { canPurchaseLicense, getPurchaseLicenseType, parsePassportPayment, purchaseLicense } from './purchaseLicense'
import type { LikenessLicense, LikenessPurchase } from './types'

type PaymentCallback = (payload: unknown) => void

const mocks = vi.hoisted(() => {
  const state: {
    paymentCallback: PaymentCallback | null
    passportStoreValue: object
    passportMock: {
      openUI: ReturnType<typeof vi.fn>
      once: ReturnType<typeof vi.fn>
      close: ReturnType<typeof vi.fn>
    }
  } = {
    paymentCallback: null,
    passportStoreValue: {},
    passportMock: {
      openUI: vi.fn(),
      once: vi.fn(),
      close: vi.fn(),
    },
  }

  state.passportMock.once.mockImplementation((_event: string, callback: PaymentCallback) => {
    state.paymentCallback = callback
  })

  return state
})

vi.mock('$app/navigation', () => ({ goto: vi.fn() }))
vi.mock('$lib', () => ({ authStore: { getAccessToken: vi.fn() } }))
vi.mock('$lib/passport.store', () => ({ passportStore: mocks.passportStoreValue }))
vi.mock('$lib/stores/config.svelte', () => ({
  ContractName: {
    CONTENT_NFT: 'CONTENT_NFT',
    LICENSE_NFT: 'LICENSE_NFT',
  },
  configStore: {
    getContract: vi.fn(),
    getContractAddress: vi.fn(),
  },
}))
vi.mock('@credenza3/passport-evm', () => ({
  Passport: {
    events: { PAYMENT: 'PAYMENT' },
    pages: { PAYMENT: 'payment', RICH_ALERT: 'richAlert' },
  },
}))
vi.mock('@repo/fe-evm-provider', () => ({
  ethers: { BrowserProvider: vi.fn() },
  initProvider: vi.fn(),
}))
vi.mock('@repo/fe-services', () => ({ forwardTransaction: vi.fn() }))
vi.mock('svelte/store', () => ({
  get: vi.fn((store: object) => (store === mocks.passportStoreValue ? mocks.passportMock : undefined)),
}))

const basePurchase: LikenessPurchase = {
  id: 'likeness-1',
  contentTokenId: '123',
  name: 'Avery Stone',
  stageName: 'Avery',
  bio: '',
  attributes: [],
  affiliations: [],
  licenses: [],
  permittedUses: [],
  territories: [],
  allowRetouching: false,
  approveFinalUse: false,
  images: [],
  media: [],
}

const perpetualLicense: LikenessLicense = {
  id: 'perpetual',
  name: 'Perpetual',
  price: '100',
  detail: '',
  description: '',
}

const singleUseLicense: LikenessLicense = {
  id: 'single-use',
  name: 'Single-use',
  price: '10',
  detail: '',
  description: '',
}

const unsupportedLicense: LikenessLicense = {
  id: 'limited-run',
  name: 'Limited run',
  price: '25',
  detail: '',
  description: '',
}

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

const richAlertPayload = (hash: string) => ({
  richAlertData: {
    title: 'License Purchased',
    description: 'Your license is available in purchases.',
    action: {
      text: 'View Transaction',
      onClick: expect.any(Function),
    },
    closeButtonText: 'Close',
  },
})

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('VITE_CLIENT_ID', 'client-id')
  vi.stubEnv('VITE_CREDENZA_EVM_WSS', 'wss://evm')
  mocks.paymentCallback = null
  mocks.passportMock.once.mockImplementation((_event: string, callback: PaymentCallback) => {
    mocks.paymentCallback = callback
  })
  vi.mocked(authStore.getAccessToken).mockResolvedValue('access-token')
  vi.mocked(configStore.getContractAddress).mockImplementation((contractName) => {
    if (contractName === ContractName.CONTENT_NFT) return '0xcontent'
    if (contractName === ContractName.LICENSE_NFT) return '0xlicense'
    return ''
  })
})

describe('purchase license helpers', () => {
  it('maps supported license IDs to passport license types', () => {
    expect(getPurchaseLicenseType('perpetual')).toBe('0')
    expect(getPurchaseLicenseType('single-use')).toBe('2')
    expect(getPurchaseLicenseType('limited-run')).toBeNull()
  })

  it('allows supported licenses with a content token ID', () => {
    expect(canPurchaseLicense(basePurchase, perpetualLicense)).toBe(true)
    expect(canPurchaseLicense(basePurchase, singleUseLicense)).toBe(true)
  })

  it('rejects missing content token IDs and unsupported licenses', () => {
    expect(canPurchaseLicense({ ...basePurchase, contentTokenId: undefined }, perpetualLicense)).toBe(false)
    expect(canPurchaseLicense({ ...basePurchase, contentTokenId: ' ' }, singleUseLicense)).toBe(false)
    expect(canPurchaseLicense(basePurchase, unsupportedLicense)).toBe(false)
  })
})

describe('parsePassportPayment', () => {
  it.each([
    ['root data hash', { type: 'WALLET', data: { hash: '0xdata-hash' } }, '0xdata-hash'],
    ['results hash', { type: 'WALLET', results: { hash: '0xresults-hash' } }, '0xresults-hash'],
    ['results item tx', { type: 'WALLET', results: { items: [{ tx: '0xitem-tx' }] } }, '0xitem-tx'],
    ['results item hash', { type: 'WALLET', results: { items: [{ hash: '0xitem-hash' }] } }, '0xitem-hash'],
  ])('parses direct payments from %s', (_label, payload, expectedHash) => {
    expect(parsePassportPayment(payload)).toEqual({ kind: 'direct', hash: expectedHash })
  })

  it.each(['CARD', 'STRIPE'])('parses %s card voucher payments', (type) => {
    expect(
      parsePassportPayment({
        type,
        results: {
          items: [{ outcome: { voucher: 'voucher-string', sig: '0xsig' } }],
        },
      }),
    ).toEqual({ kind: 'card', voucher: 'voucher-string', sig: '0xsig' })
  })

  it('throws when a card payload is missing a voucher outcome', () => {
    expect(() =>
      parsePassportPayment({
        type: 'CARD',
        results: { items: [{ outcome: { voucher: '', sig: '0xsig' } }] },
      }),
    ).toThrow('Missing card payment voucher outcome')
  })

  it('throws when a direct payment is missing a transaction hash', () => {
    expect(() => parsePassportPayment({ type: 'WALLET', results: { items: [{}] } })).toThrow(
      'Missing payment transaction hash',
    )
  })
})

describe('purchaseLicense', () => {
  it('opens the payment UI and rich alert for direct payments', async () => {
    const purchasePromise = purchaseLicense({ purchase: basePurchase, license: perpetualLicense })
    await flushPromises()

    expect(mocks.passportMock.once).toHaveBeenCalledWith('PAYMENT', expect.any(Function))
    expect(mocks.passportMock.openUI).toHaveBeenCalledWith('payment', {
      title: 'Buy Perpetual',
      subtitle: 'Avery Stone',
      licenses: [
        {
          contractAddress: '0xcontent',
          licenseContractAddress: '0xlicense',
          licenseType: '0',
          contentTokenId: '123',
          amount: 1,
        },
      ],
    })

    mocks.paymentCallback?.({
      type: 'WALLET',
      results: { items: [{ hash: '0xdirect-hash' }] },
    })
    await purchasePromise

    expect(goto).toHaveBeenCalledWith('/authed/purchases')
    expect(mocks.passportMock.openUI).toHaveBeenLastCalledWith('richAlert', richAlertPayload('0xdirect-hash'))
  })

  it('redeems card payments before showing the purchase alert', async () => {
    const signer = { getAddress: vi.fn().mockResolvedValue('0xuser') }
    const waitForTransaction = vi.fn().mockResolvedValue({ hash: '0xforwarded-hash' })
    const redeem = {
      populateTransaction: vi.fn().mockResolvedValue({ to: '0xlicense', data: '0xdata' }),
    }
    const provider = { provider: 'mock-provider' } as unknown as Awaited<ReturnType<typeof initProvider>>

    vi.mocked(initProvider).mockResolvedValue(provider)
    vi.mocked(ethers.BrowserProvider).mockImplementation(function () {
      return { getSigner: vi.fn().mockResolvedValue(signer), waitForTransaction } as never
    })
    vi.mocked(configStore.getContract).mockReturnValue({ redeem } as never)
    vi.mocked(forwardTransaction).mockResolvedValue('0xforwarded-hash')

    const purchasePromise = purchaseLicense({ purchase: basePurchase, license: singleUseLicense })
    await flushPromises()

    mocks.paymentCallback?.({
      type: 'CARD',
      results: {
        items: [{ outcome: { voucher: 'voucher-string', sig: '0xsig' } }],
      },
    })
    await purchasePromise

    expect(redeem.populateTransaction).toHaveBeenCalledWith('0xuser', 'voucher-string', '0xsig')
    expect(forwardTransaction).toHaveBeenCalledWith(
      { to: '0xlicense', data: '0xdata' },
      { token: 'access-token', client_id: 'client-id', evm_wss: 'wss://evm' },
    )
    expect(waitForTransaction).toHaveBeenCalledWith('0xforwarded-hash')
    expect(goto).toHaveBeenCalledWith('/authed/purchases')
    expect(mocks.passportMock.openUI).toHaveBeenLastCalledWith('richAlert', richAlertPayload('0xforwarded-hash'))
  })

  it('rejects unsupported licenses before opening payment UI', async () => {
    await expect(purchaseLicense({ purchase: basePurchase, license: unsupportedLicense })).rejects.toThrow(
      'Unsupported license type: limited-run',
    )
    expect(mocks.passportMock.openUI).not.toHaveBeenCalled()
  })

  it('rejects missing content token IDs before opening payment UI', async () => {
    await expect(
      purchaseLicense({
        purchase: { ...basePurchase, contentTokenId: undefined },
        license: perpetualLicense,
      }),
    ).rejects.toThrow('Missing content token ID for license purchase')
    expect(mocks.passportMock.openUI).not.toHaveBeenCalled()
  })
})
