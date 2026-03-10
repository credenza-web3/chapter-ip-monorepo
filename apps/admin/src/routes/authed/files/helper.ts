import type { ethers } from "@repo/fe-evm-provider"

interface RecentFile {
  id: string
  title: string
  description: string
  image?: string
  openedAt: string
}

export const addToRecent = (fileId: string, title: string, description: string, image?: string) => {
  const recent: RecentFile = {
    id: fileId,
    title,
    description,
    image,
    openedAt: new Date().toISOString()
  }

  let existing = JSON.parse(localStorage.getItem('recentFiles') || '[]')
  existing = existing.filter((f: RecentFile) => f.id !== fileId)
  existing.unshift(recent)
  existing = existing.slice(0, 3)

  localStorage.setItem('recentFiles', JSON.stringify(existing))
}

export const loadRecentFiles = () => {
  const stored = localStorage.getItem('recentFiles')
  if (stored) {
    return JSON.parse(stored) as RecentFile[]
  }
  return [] as RecentFile[]
}

export const getFilePricing = async (contentContract: ethers.Contract, tokenId: string) => {
  const fulltimeLicensePrice = Number(await contentContract.getLicensePriceFiat(tokenId, '0')) / 100
  const onetimeLicensePrice = Number(await contentContract.getLicensePriceFiat(tokenId, '2')) / 100
  return { fulltimeLicensePrice, onetimeLicensePrice }
}