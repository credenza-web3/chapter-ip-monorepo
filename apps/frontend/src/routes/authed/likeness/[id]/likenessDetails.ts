import { DEFAULT_IMAGE_URL, getPreviewUrl } from '../likeness'
import type {
  LikenessAffiliation,
  LikenessContent,
  LikenessDetails,
  LikenessLicense,
  LikenessLicensingMetadataInput,
  LikenessProfileAffiliation,
  LikenessProfileAttributes,
} from '@repo/content-types/likeness'

type LikenessContentInput = LikenessContent

const LICENSE_NAMES: Record<string, string> = {
  'single-use': 'Single-use campaign',
  'time-limited': 'Time-limited commercial',
  perpetual: 'Perpetual brand ambassador',
  'ai-digital': 'AI and digital use',
  bulk: 'Bulk licensing',
}

const LICENSE_DESCRIPTIONS: Record<string, string> = {
  'single-use':
    'One approved use across a single campaign. Buyer cannot reuse the asset for a separate project, extend the run, or sublicense without purchasing a new license.',
  'time-limited':
    'Commercial use across multiple placements within a defined window. The asset is automatically retired from the buyer’s library when the term ends.',
  perpetual:
    'Ongoing partnership for buyers who want long-term association with your digital likeness. Priced as a recurring fee. End the license at any time to stop all future use.',
}

const PERMITTED_USE_NAMES: Record<string, string> = {
  ai: 'AI',
  commercial: 'Commercial',
  digital: 'Digital',
  'film-tv': 'Film and TV',
}

function formatLabel(value: string): string {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatHeight(attributes: Partial<LikenessProfileAttributes> | undefined): string {
  const feet = attributes?.heightFt ?? ''
  const inches = attributes?.heightIn ?? ''
  if (!feet && !inches) return ''

  const imperial = [feet && `${feet}'`, inches && `${inches}"`].filter(Boolean).join(' ')
  const totalInches = Number(feet || 0) * 12 + Number(inches || 0)
  if (!Number.isFinite(totalInches) || totalInches <= 0) return imperial

  return `${imperial} (${Math.round(totalInches * 2.54)} cm)`
}

function formatWeight(value: string | undefined): string {
  const weight = value ?? ''
  if (!weight) return ''

  const pounds = Number(weight)
  if (!Number.isFinite(pounds) || pounds <= 0) return `${weight} lbs`

  return `${weight} lbs (${(pounds * 0.453592).toFixed(1)} kg)`
}

function getAffiliations(affiliations: Array<Partial<LikenessProfileAffiliation>> | undefined): LikenessAffiliation[] {
  return (affiliations ?? []).flatMap((affiliation) => {
    const union = affiliation.union ?? ''
    const memberId = affiliation.memberId ?? ''
    return union || memberId ? [{ union, memberId }] : []
  })
}

function getLicenses(licensing: LikenessLicensingMetadataInput | undefined): LikenessLicense[] {
  const enabledTypes = licensing?.licenseTypes ?? {}
  const prices = licensing?.licensePrices ?? {}
  const details = licensing?.licenseDropdowns ?? {}

  return Object.entries(enabledTypes).flatMap(([id, enabled]) => {
    if (enabled !== true) return []

    const price = prices[id] || '0'
    return [
      {
        id,
        name: LICENSE_NAMES[id] ?? formatLabel(id),
        price,
        detail: details[id] ?? '',
        description: LICENSE_DESCRIPTIONS[id] ?? '',
      },
    ]
  })
}

function getPermittedUses(permittedUses: Record<string, boolean> | undefined): string[] {
  return Object.entries(permittedUses ?? {}).flatMap(([id, enabled]) =>
    enabled === true ? [PERMITTED_USE_NAMES[id] ?? formatLabel(id)] : [],
  )
}

function getMedia(content: LikenessContentInput, name: string, contractAddress: string): LikenessDetails['media'] {
  return (content.files ?? []).map((file) => {
    const filename = file.filename || file.label
    const id = file.id || filename

    if (file.mimetype.startsWith('image/')) {
      return {
        id,
        type: 'image' as const,
        src: getPreviewUrl(contractAddress, content.id, filename),
        alt: `${name} ${filename}`,
      }
    }

    const type = file.mimetype.startsWith('video/')
      ? ('video' as const)
      : file.mimetype.startsWith('audio/')
        ? ('audio' as const)
        : ('file' as const)

    return {
      id,
      type,
      label: filename,
    }
  })
}

export function normalizeLikeness(content: LikenessContentInput, contractAddress: string): LikenessDetails | null {
  const metadata = content.metadata
  console.log(content)
  if (metadata?.type !== 'likeness') return null

  const profile = metadata.profile
  const attributes = profile?.attributes
  const licensing = metadata.licensing
  const name = profile?.fullLegalName || 'Unnamed likeness'
  const media = getMedia(content, name, contractAddress)
  const images = media.flatMap((item) => (item.type === 'image' ? [{ src: item.src, alt: item.alt }] : []))

  return {
    id: content.id,
    contentTokenId: content.tokenId ?? '',
    name,
    stageName: profile?.stageName ?? '',
    bio: profile?.bio ?? '',
    attributes: [
      { label: 'Ethnicity', value: attributes?.ethnicity ?? '' },
      { label: 'Height', value: formatHeight(attributes) },
      { label: 'Weight', value: formatWeight(attributes?.weight) },
      { label: 'Eye color', value: attributes?.eyeColor ?? '' },
      { label: 'Hair color', value: attributes?.hairColor ?? '' },
    ].filter((attribute) => attribute.value),
    affiliations: getAffiliations(profile?.affiliations),
    licenses: getLicenses(licensing),
    permittedUses: getPermittedUses(licensing?.permittedUses),
    territories: (licensing?.territories ?? []).filter(Boolean),
    allowRetouching: licensing?.allowRetouching === 'yes',
    approveFinalUse: licensing?.approveFinalUse === 'yes',
    images: images.length > 0 ? images : [{ src: DEFAULT_IMAGE_URL, alt: `${name} default likeness preview` }],
    media,
  }
}
