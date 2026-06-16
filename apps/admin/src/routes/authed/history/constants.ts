export interface TPurchaseHistoryItem {
  id: string
  buyerAddress: string
  contentId: string
  licenseType: number
  priceFiat: string
  priceToken: string
  priceEther: string
  currencyTokenContract: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

export const HistoryMenuItems = [
  {
    text: 'View content',
    action: 'view-content',
  },
]
