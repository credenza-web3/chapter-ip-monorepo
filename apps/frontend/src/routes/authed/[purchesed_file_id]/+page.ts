import type { ProductDetail } from '$lib/product'

export const load = async ({ params }) => {
  const purchase: ProductDetail = {
    id: '1',
    title: 'Advanced JS Patterns',
    description: 'Deep dive into advanced JS techniques',
    price: 29.99,
    publisher: {
      id: '1',
      name: 'John Doe',
    },
  }

  return {
    purchase,
  }
}
