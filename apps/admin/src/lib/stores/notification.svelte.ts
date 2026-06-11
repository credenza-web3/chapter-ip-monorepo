import { writable } from 'svelte/store'
import type { TNotificationItem } from '@repo/notifications'

export const notificationStore = writable<TNotificationItem[]>([])
