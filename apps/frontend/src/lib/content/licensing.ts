export function trimString(value: unknown): string {
  return value == null ? '' : String(value).trim()
}

export function formatLabel(value: string): string {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export type ContentLicense = {
  id: string
  name: string
  price: string
  description: string
}

type LicensingMetadataInput = {
  licenseTypes?: Record<string, boolean>
  licensePrices?: Record<string, string>
}

type GetLicensesOptions = {
  licenseNames: Record<string, string>
  licenseDescriptions: Record<string, string>
  allowedIds?: string[]
}

export function getLicenses(
  licensing: LicensingMetadataInput | undefined,
  { licenseNames, licenseDescriptions, allowedIds }: GetLicensesOptions,
): ContentLicense[] {
  const enabledTypes = licensing?.licenseTypes ?? {}
  const prices = licensing?.licensePrices ?? {}

  return Object.entries(enabledTypes).flatMap(([id, enabled]) => {
    if (enabled !== true) return []
    if (allowedIds && !allowedIds.includes(id)) return []

    const price = trimString(prices[id]) || '0'
    return [
      {
        id,
        name: licenseNames[id] ?? formatLabel(id),
        price,
        description: licenseDescriptions[id] ?? '',
      },
    ]
  })
}
