import { LICENSE_TYPE_OPTIONS, LOCATION_LICENSE_DESCRIPTIONS } from '@repo/content-types/location'
import type { AppRouter, TRPCClient } from '@repo/trpc/client'

type UpdateContentMetadataInput = Parameters<TRPCClient<AppRouter>['contents']['updateContentMetadata']['mutate']>[0]
export type StatusValue = NonNullable<UpdateContentMetadataInput['status']>

type LicenseTypeOption = {
  id: string
  label: string
  description: string
}

export const LICENSE_TYPES: LicenseTypeOption[] = LICENSE_TYPE_OPTIONS.map((option) => ({
  id: option.value,
  label: option.label,
  description: LOCATION_LICENSE_DESCRIPTIONS[option.value] ?? '',
}))

export const STATUS = {
  DRAFT: 'DRAFT' as StatusValue,
  ACTIVE: 'ACTIVE' as StatusValue,
  SALE_DISABLED: 'SALE_DISABLED' as StatusValue,
} as const
