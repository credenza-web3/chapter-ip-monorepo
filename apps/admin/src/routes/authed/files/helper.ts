import { authStore } from '$lib'
import type { ethers } from '@repo/fe-evm-provider'

export interface RecentFile {
  id: string
  title: string
  description: string
  publisherId: string
  image?: string
  openedAt: string
}
export const addToRecent = async (
  fileId: string,
  title: string,
  description: string,
  image?: string
) => {

  if (typeof localStorage === 'undefined') {
    return
  }

  const publisherId = await authStore.getSubFromToken()
  if (!publisherId) return

  const recent: RecentFile = {
    id: fileId,
    title,
    description,
    publisherId,
    image,
    openedAt: new Date().toISOString(),
  }

  let existing: RecentFile[] = JSON.parse(localStorage.getItem('recentFiles') || '[]')
  existing = existing.filter(f => !(f.id === fileId && f.publisherId === publisherId))
  existing.unshift(recent)
  existing = existing.slice(0, 3)

  localStorage.setItem('recentFiles', JSON.stringify(existing))
}

export const loadRecentFiles = async () => {
  const stored = localStorage.getItem('recentFiles')
  if (!stored) return [] as RecentFile[]

  const publisherId = await authStore.getSubFromToken()
  if (!publisherId) return [] as RecentFile[]

  const all: RecentFile[] = JSON.parse(stored)
  return all.filter(f => f.publisherId === publisherId)
}

export const getFilePricing = async (contentContract: ethers.Contract, tokenId: string) => {
  const fulltimeLicensePrice = Number(await contentContract.getLicensePriceFiat(tokenId, '0')) / 100
  const onetimeLicensePrice = Number(await contentContract.getLicensePriceFiat(tokenId, '2')) / 100
  return { fulltimeLicensePrice, onetimeLicensePrice }
}
