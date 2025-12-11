import { browser } from '$app/environment'
import { authStore } from '$lib'
import { getSigner, initProvider } from '@repo/fe-evm-provider'
import { createClient } from '@repo/trpc/client'
import { redirect } from '@sveltejs/kit'

export const prerender = false
export const ssr = false

let authInitialized = false

export const load = async ({ url }) => {
  if (!browser) return {}

  if (!authInitialized) {
    authInitialized = true
    await authStore.init()
  }

  const accessToken = await authStore.getAccessToken()

  if (!accessToken) {
    throw redirect(302, `/`)
  }

  const trpcClient = createClient({
    trpcUrl: import.meta.env.VITE_TRPC_URL || 'http://localhost:8060/trpc',
    getAccessTokenFn: () => authStore.state.accessToken!,
  })

  if (url.pathname === '/authed/publisher/create') {
    return { trpcClient }
  }

  const sub = await authStore.getSubFromToken()
  try {
    const publisher = await trpcClient.publishers.getPublisher.query({
      sub: sub!,
    })
    initProvider(accessToken)
    const signer = await getSigner()
    const userAddress = await signer.getAddress()
    return { trpcClient, publisher, userAddress }
  } catch {
    throw redirect(302, `/authed/publisher/create`)
  }
}
