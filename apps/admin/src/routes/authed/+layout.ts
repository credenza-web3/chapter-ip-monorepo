import { browser } from '$app/environment'
import { authStore } from '$lib'
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

  if (url.pathname === '/authed/publisher/create') {
    return {}
  }

  const trpcClient = createClient({
    trpcUrl: import.meta.env.VITE_TRPC_URL || 'http://localhost:8060/trpc',
    getAccessTokenFn: () => authStore.state.accessToken!,
  })
  const sub = await authStore.getSubFromToken()
  console.log('Sub:', sub)
  try {
    const publisher = await trpcClient.publisher.getPublisher.query({
      sub: sub!,
    })

    return { publisher }
  } catch {
    throw redirect(302, `/authed/publisher/create`)
  }
}
