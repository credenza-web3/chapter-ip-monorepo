import { DEFAULT_IMAGE_URL, getPreviewUrl } from '../likeness'
import type { LikenessAffiliation, LikenessLicense, LikenessPurchase } from './types'

type UnknownRecord = Record<string, unknown>

type Content = {
  id: string
  tokenId?: string
  metadata?: UnknownRecord
  files?: ContentFile[]
}

type ContentFile = {
  id: string
  filename: string
  label: string
  mimetype: string
}

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

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null
}

function getString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function getBoolean(value: unknown): boolean {
  return value === true
}

function getRecord(value: unknown): UnknownRecord {
  return isRecord(value) ? value : {}
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(getString).filter(Boolean) : []
}

function formatLabel(value: string): string {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatHeight(attributes: UnknownRecord): string {
  const feet = getString(attributes.heightFt)
  const inches = getString(attributes.heightIn)
  if (!feet && !inches) return ''

  const imperial = [feet && `${feet}'`, inches && `${inches}"`].filter(Boolean).join(' ')
  const totalInches = Number(feet || 0) * 12 + Number(inches || 0)
  if (!Number.isFinite(totalInches) || totalInches <= 0) return imperial

  return `${imperial} (${Math.round(totalInches * 2.54)} cm)`
}

function formatWeight(value: unknown): string {
  const weight = getString(value)
  if (!weight) return ''

  const pounds = Number(weight)
  if (!Number.isFinite(pounds) || pounds <= 0) return `${weight} lbs`

  return `${weight} lbs (${(pounds * 0.453592).toFixed(1)} kg)`
}

function getAffiliations(value: unknown): LikenessAffiliation[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((item) => {
    const affiliation = getRecord(item)
    const union = getString(affiliation.union)
    const memberId = getString(affiliation.memberId)
    return union || memberId ? [{ union, memberId }] : []
  })
}

function getLicenses(licensing: UnknownRecord): LikenessLicense[] {
  const enabledTypes = getRecord(licensing.licenseTypes)
  const prices = getRecord(licensing.licensePrices)
  const details = getRecord(licensing.licenseDropdowns)

  return Object.entries(enabledTypes).flatMap(([id, enabled]) => {
    if (!getBoolean(enabled)) return []

    const price = getString(prices[id]) || '0'
    return [
      {
        id,
        name: LICENSE_NAMES[id] ?? formatLabel(id),
        price,
        detail: getString(details[id]),
        description: LICENSE_DESCRIPTIONS[id] ?? '',
      },
    ]
  })
}

function getPermittedUses(value: unknown): string[] {
  return Object.entries(getRecord(value)).flatMap(([id, enabled]) =>
    getBoolean(enabled) ? [PERMITTED_USE_NAMES[id] ?? formatLabel(id)] : [],
  )
}

function getMedia(content: Content, name: string, contractAddress: string): LikenessPurchase['media'] {
  return (content.files ?? []).map((file) => {
    const filename = getString(file.filename) || getString(file.label)
    const id = getString(file.id) || filename

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

export function toLikenessPurchase(content: Content, contractAddress: string): LikenessPurchase | null {
  const metadata = getRecord(content.metadata)
  if (metadata.type !== 'likeness') return null

  const profile = getRecord(metadata.profile)
  const attributes = getRecord(profile.attributes)
  const licensing = getRecord(metadata.licensing)
  const name = getString(profile.fullLegalName) || 'Unnamed likeness'
  const media = getMedia(content, name, contractAddress)
  const images = media.flatMap((item) => (item.type === 'image' ? [{ src: item.src, alt: item.alt }] : []))

  return {
    id: content.id,
    contentTokenId: getString(content.tokenId),
    name,
    stageName: getString(profile.stageName),
    bio: getString(profile.bio),
    attributes: [
      { label: 'Ethnicity', value: getString(attributes.ethnicity) },
      { label: 'Height', value: formatHeight(attributes) },
      { label: 'Weight', value: formatWeight(attributes.weight) },
      { label: 'Eye color', value: getString(attributes.eyeColor) },
      { label: 'Hair color', value: getString(attributes.hairColor) },
    ].filter((attribute) => attribute.value),
    affiliations: getAffiliations(profile.affiliations),
    licenses: getLicenses(licensing),
    permittedUses: getPermittedUses(licensing.permittedUses),
    territories: getStringArray(licensing.territories),
    allowRetouching: licensing.allowRetouching === 'yes',
    approveFinalUse: licensing.approveFinalUse === 'yes',
    images: images.length > 0 ? images : [{ src: DEFAULT_IMAGE_URL, alt: `${name} default likeness preview` }],
    media,
  }
}
