import type { ConfigResponse } from '$lib/types/config'

function createConfigStore() {
  let data = $state<ConfigResponse | null>(null)

  return {
    get state() {
      return data
    },
    set(config: ConfigResponse) {
      data = config
    },
    get contractAddresses() {
      return data?.contractAddresses
    },
    get chainId() {
      return data?.chainId
    },
  }
}

export const configStore = createConfigStore()
