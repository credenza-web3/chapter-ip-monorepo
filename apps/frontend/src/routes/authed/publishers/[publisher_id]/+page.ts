export interface Product {
  id: string
  title: string
  description: string
  price: number
  fileSize: string
  format: string
}

export const load = async ({ params }) => {
  const publisher = {
    id: params.publisher_id,
    name: 'TechBooks Publishing',
    description: 'Leading publisher of technical books and guides',
  }

  const products: Product[] = [
    {
      id: 'file-1',
      title: 'Advanced TypeScript Patterns',
      description: 'Deep dive into advanced TypeScript techniques',
      price: 29.99,
      fileSize: '15 MB',
      format: 'PDF',
    },
    {
      id: 'file-2',
      title: 'Web Performance Optimization',
      description: 'Complete guide to optimizing web applications',
      price: 34.99,
      fileSize: '22 MB',
      format: 'PDF',
    },
    {
      id: 'file-3',
      title: 'Modern CSS Masterclass',
      description: 'Master modern CSS features and techniques',
      price: 24.99,
      fileSize: '18 MB',
      format: 'PDF',
    },
  ]

  return { publisher, products }
}
