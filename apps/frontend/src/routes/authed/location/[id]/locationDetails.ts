import { DEFAULT_IMAGE_URL } from '$lib/content/image'
import { getLicenses, trimString } from '$lib/content/licensing'
import { getPreviewUrl } from '../location'
import { LICENSE_TYPE_OPTIONS, LOCATION_LICENSE_DESCRIPTIONS } from '@repo/content-types/location'
import type { LocationContent, LocationDetails } from '@repo/content-types/location'

const LICENSE_NAMES = Object.fromEntries(LICENSE_TYPE_OPTIONS.map((option) => [option.value, option.label]))

export function normalizeLocation(
  content: LocationContent,
  contractAddress: string,
  authorName = '',
): LocationDetails | null {
  const metadata = content.metadata
  if (metadata?.type !== 'location') return null

  const name = trimString(metadata.name) || 'Unnamed location'
  const fileName = trimString(metadata.file_name)

  return {
    id: content.id,
    contentTokenId: trimString(content.tokenId),
    name,
    description: trimString(metadata.description),
    tags: (metadata.tags ?? []).map(trimString).filter(Boolean),
    authorName: trimString(authorName),
    licenses: getLicenses(metadata.licensing, {
      licenseNames: LICENSE_NAMES,
      licenseDescriptions: LOCATION_LICENSE_DESCRIPTIONS,
      allowedIds: ['single-use'],
    }),
    image: {
      src: fileName ? getPreviewUrl(contractAddress, content.id, fileName) : DEFAULT_IMAGE_URL,
      alt: name,
    },
  }
}
