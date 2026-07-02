import { DEFAULT_IMAGE_URL } from './likeness/likeness'
import type { LikenessItem } from './likeness/likeness'
import type { LocationItem } from './location/location'

export type DashboardCard = {
  id: string
  title: string
  description: string
  imageUrl: string
}

export type DashboardSection = {
  title: string
  ctaLabel: string
  href?: string
  disabled?: boolean
  items: DashboardCard[]
}

export const MOCK_CREATIVE_WORKS: DashboardCard[] = [
  {
    id: 'project-hail-mary',
    title: 'Project Hail Mary',
    description: 'Ryland Grace is the sole survivor on a desperate last-chance mission.',
    imageUrl: DEFAULT_IMAGE_URL,
  },
  {
    id: 'bring-him-home',
    title: 'Bring Him Home',
    description: 'A stranded explorer faces the long road home across an impossible frontier.',
    imageUrl: DEFAULT_IMAGE_URL,
  },
  {
    id: 'new-gods-new-gravity',
    title: 'New Gods, New Gravity: A funny end of a small world',
    description: 'A strange orbit pulls an isolated community into a mythic frenzy.',
    imageUrl: DEFAULT_IMAGE_URL,
  },
  {
    id: 'dove',
    title: 'Dove',
    description: 'A former marine and a mystery author collide in a twisty romance.',
    imageUrl: DEFAULT_IMAGE_URL,
  },
  {
    id: 'her-list',
    title: 'Her List',
    description: 'One checklist, five first dates, and a carefully guarded heart.',
    imageUrl: DEFAULT_IMAGE_URL,
  },
]

export function toDashboardCards(items: LikenessItem[]): DashboardCard[] {
  return items.slice(0, 5).map((item) => ({
    id: item.id,
    title: item.name || 'Unnamed likeness',
    description: item.bio || 'No biography available yet.',
    imageUrl: item.imageUrl,
  }))
}

export function toLocationDashboardCards(items: LocationItem[]): DashboardCard[] {
  return items.slice(0, 5).map((item) => ({
    id: item.id,
    title: item.name || 'Unnamed location',
    description: item.description || 'No description available yet.',
    imageUrl: item.imageUrl,
  }))
}
