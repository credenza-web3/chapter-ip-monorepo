import { writable } from 'svelte/store'
import { Passport } from '@credenza3/passport-evm'

export const passportStore = writable<Passport | null>(null)
