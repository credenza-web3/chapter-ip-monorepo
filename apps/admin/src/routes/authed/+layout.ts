import { browser } from '$app/environment'
import { authStore } from '$lib'
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

  console.log('Checking create page...')
  if (url.pathname === '/authed/publisher/create') {
    console.log('On create page, returning early')
    return {}
  }

  console.log('Not on create page, checking publisher...')
  const isPublisherCreated = false
  if (!isPublisherCreated) {
    console.log('Redirecting to create page')
    throw redirect(302, `/authed/publisher/create`)
  }

  return {}
}
