<script lang="ts">
  import BaseContractHistory from './BaseContractHistory.svelte'
  import { abi } from '@credenza3/contracts/artifacts/ContentNftContract.json'

  const { userAddress }: { userAddress: string } = $props()
  const contractAddress = import.meta.env.VITE_EVM_CONTENT_NFT_CONTRACT_ADDRESS
</script>

<BaseContractHistory {userAddress} {contractAddress} {abi} />
