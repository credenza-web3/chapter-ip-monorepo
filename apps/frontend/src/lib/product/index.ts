export interface ProductDetail {
  id: string
  title: string
  description: string
  price: number
  publisher: {
    id: string
    name: string
  }
}
