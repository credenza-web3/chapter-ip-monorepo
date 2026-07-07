import { LICENSE_TYPE_OPTIONS } from '@repo/content-types/likeness'
import type { AppRouter, TRPCClient } from '@repo/trpc/client'

type UpdateContentMetadataInput = Parameters<TRPCClient<AppRouter>['contents']['updateContentMetadata']['mutate']>[0]
export type StatusValue = NonNullable<UpdateContentMetadataInput['status']>

type LicenseTypeOption = {
  id: string
  label: string
  description: string
}

const LICENSE_TYPE_LABELS: Record<string, string> = {
  'single-use': 'One-time license',
  perpetual: 'Subscription',
}

const LICENSE_TYPE_DESCRIPTIONS: Record<string, string> = {
  'single-use': 'Clears this location for a single project. One use, one payment — no ongoing rights.',
  perpetual:
    'Ongoing partnership for buyers who want long-term association with your location. Priced as a recurring fee. End the license at any time to stop all future use.',
}

export const LICENSE_TYPES: LicenseTypeOption[] = LICENSE_TYPE_OPTIONS.map((option) => ({
  id: option.value,
  label: LICENSE_TYPE_LABELS[option.value] ?? option.label,
  description: LICENSE_TYPE_DESCRIPTIONS[option.value],
}))

export const STATUS = {
  DRAFT: 'DRAFT' as StatusValue,
  ACTIVE: 'ACTIVE' as StatusValue,
  SALE_DISABLED: 'SALE_DISABLED' as StatusValue,
} as const
