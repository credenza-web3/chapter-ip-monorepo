import type { ProductDetail } from '$lib/product'

export const load = async ({ params }) => {
  const purchases: ProductDetail[] = [
    {
      id: '1',
      title: 'Advanced JS Patterns',
      description: 'Deep dive into advanced JS techniques',
      price: 29.99,
      publisher: {
        id: '1',
        name: 'John Doe',
      },
    },
    {
      id: '2',
      title: 'Advanced TypeScript Patterns',
      description: 'Deep dive into advanced TypeScript techniques',
      price: 29.99,
      publisher: {
        id: '2',
        name: 'Jane Doe',
      },
    },
  ]

  return {
    purchases,
  }
}
