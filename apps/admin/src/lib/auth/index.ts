import { createAuthStore, getAuthConfig } from '@repo/fe-auth'
import { browser } from '$app/environment'
import { goto } from '$app/navigation'
import { resolve } from '$app/paths'

export const authStore = createAuthStore(getAuthConfig(import.meta.env), {
  browser,
  goto,
  resolve,
})
