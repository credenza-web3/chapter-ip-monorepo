export interface Publisher {
  id: string
  name: string
  description: string
  productCount: number
}

export const load = async () => {
  const publishers: Publisher[] = [
    {
      id: '1',
      name: 'TechBooks Publishing',
      description: 'Leading publisher of technical books and guides',
      productCount: 45,
    },
    {
      id: '2',
      name: 'Creative Media Group',
      description: 'Design and creative content specialists',
      productCount: 32,
    },
    {
      id: '3',
      name: 'Education Press',
      description: 'Educational materials and textbooks',
      productCount: 78,
    },
  ]

  return { publishers }
}
