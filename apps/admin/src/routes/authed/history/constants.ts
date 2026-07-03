export interface TPurchaseHistoryItem {
  id: string
  buyerAddress: string
  contentId: string
  licenseType: number
  priceFiat?: string
  priceToken?: string
  priceEther?: string
  currencyTokenContract?: string
  txHash: string
  metadata?: Record<string, unknown>
  ownerId: string
  createdAt: string
  updatedAt: string
}

export const HistoryMenuItems = [
  {
    text: 'View details',
    action: 'view-content',
  },
]
