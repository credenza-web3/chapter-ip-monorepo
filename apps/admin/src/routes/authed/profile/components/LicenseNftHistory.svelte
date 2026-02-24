<script lang="ts">
  import BaseContractHistory from './BaseContractHistory.svelte'
  import { abi } from '@credenza3/contracts/artifacts/LicenseNftContract.json'

  const { userAddress, activeTab }: { userAddress?: string, activeTab?: string } = $props()
  const contractAddress = import.meta.env.VITE_EVM_LICENSE_NFT_CONTRACT_ADDRESS
</script>

<BaseContractHistory {userAddress} {contractAddress} {abi} {activeTab} />
