import type { ProductDetail } from '$lib/product'

export const load = async ({ params }) => {
  const product: ProductDetail = {
    id: params.file_id,
    title: 'Advanced TypeScript Patterns',
    description: 'Deep dive into advanced TypeScript techniques',
    price: 29.99,
    publisher: {
      id: params.publisher_id,
      name: 'John Doe',
    },
  }

  return {
    product,
    publisherId: params.publisher_id,
  }
}
