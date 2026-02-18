<script lang="ts">
  import BaseContractHistory from './BaseContractHistory.svelte'
  import { abi } from '@credenza3/contracts/artifacts/CredenzaToken.json'
  import { ethers } from '@repo/fe-evm-provider'

  const { userAddress }: { userAddress?: string } = $props()
  const contractAddress = import.meta.env.VITE_EVM_CRED_CONTRACT_ADDRESS

  function formatAmount(args: any) {
    const value = args[2]
    return ethers.formatUnits(value, 6)
  }
</script>

<BaseContractHistory {userAddress} {contractAddress} {abi} {formatAmount} />
