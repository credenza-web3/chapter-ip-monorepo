import { browser } from '$app/environment'
import { authStore } from '$lib'
import { createClient } from '@repo/trpc/client'
import { redirect } from '@sveltejs/kit'

export const prerender = false
export const ssr = false

let authInitialized = false

export const load = async () => {
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
    getAccessTokenFn: () => accessToken,
  })

  return {
    accessToken,
    trpcClient,
  }
}
