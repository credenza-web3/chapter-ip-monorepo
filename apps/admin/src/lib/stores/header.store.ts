import { writable } from 'svelte/store'

export const headerStore = writable({
  hasNotifications: false,
}) 