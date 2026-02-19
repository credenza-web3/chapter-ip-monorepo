<script lang="ts">
  import BaseContractHistory from './BaseContractHistory.svelte'
  import { abi } from '@credenza3/contracts/artifacts/CredenzaToken.json'

  const { userAddress }: { userAddress?: string } = $props()
  const contractAddress = import.meta.env.VITE_EVM_CRED_CONTRACT_ADDRESS
</script>

<BaseContractHistory {userAddress} {contractAddress} {abi} />
