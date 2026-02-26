import { authStore } from '$lib'
import { ethers, getSigner, initProvider } from '@repo/fe-evm-provider'
import { abi as license_abi } from '@credenza3/contracts/artifacts/LicenseNftContract.json'
import { passportStore } from '$lib/passport.store'
import { forwardTransaction } from '@repo/fe-services'
import { get } from 'svelte/store'
import { goto } from '$app/navigation'
import { Passport } from '@credenza3/passport-evm'

const CONTENT_CONTRACT = import.meta.env.VITE_EVM_CONTENT_NFT_CONTRACT_ADDRESS
const LICENSE_CONTRACT = import.meta.env.VITE_EVM_LICENSE_NFT_CONTRACT_ADDRESS

export const useLicensePurchase = () => {
  const onBuyLicense = async (tokenId: string, licenseType: string, metadata: any) => {
    const pass = get(passportStore)
    const licenseName = licenseType === '0' ? 'Fulltime' : 'Onetime'
    const itemtitle = metadata?.title || ''
    const title = `${licenseName} license for ${itemtitle} purchase`

    pass?.openUI('payment', {
      title,
      licenses: [
        {
          contractAddress: CONTENT_CONTRACT,
          licenseContractAddress: LICENSE_CONTRACT,
          licenseType,
          contentTokenId: tokenId,
          amount: 1,
        },
      ],
    })

    pass?.once(
      'PAYMENT',
      async (data: {
        type: string
        data: { hash: string }
        results: { items: Array<{ outcome: { voucher: string; sig: string } }> }
      }) => {
        if (data.type !== 'STRIPE') {
          goto('/authed/purchases')
          openConfirm(data.data.hash)
          return
        }

        try {
          if (!data.results.items[0].outcome) return
          const { voucher, sig } = data.results.items[0].outcome

          const provider = await initProvider(authStore.state.accessToken!)
          const signer = await getSigner()
          const userAddress = await signer.getAddress()
          const licenseContract = new ethers.Contract(LICENSE_CONTRACT, license_abi, signer)
          const tx = await licenseContract.redeem.populateTransaction(userAddress, voucher, sig)

          const txHash = await forwardTransaction(tx, {
            token: authStore.state.accessToken!,
            client_id: import.meta.env.VITE_CLIENT_ID,
            evm_wss: import.meta.env.VITE_CREDENZA_EVM_WSS,
          })

          const ethersProvider = new ethers.BrowserProvider(provider)
          const receipt = await ethersProvider.waitForTransaction(txHash)
          if (!receipt) throw new Error('Transaction failed')

          goto('/authed/purchases')
          openConfirm(txHash)
        } catch (error) {
          console.error('Transaction failed:', error)
        }
      },
    )
  }

  const openConfirm = (hash: string) => {
    get(passportStore)?.openUI(Passport.pages.RICH_ALERT, {
      richAlertData: {
        title: 'Get your purchase licence proof',
        action: {
          text: 'Check it out',
          onClick: () => {
            window.open(`https://testnet.snowtrace.io/tx/${hash}`, '_blank')
            get(passportStore)?.close()
          },
        },
        closeButtonText: 'cancel',
      },
    })
  }

  return { onBuyLicense }
}
