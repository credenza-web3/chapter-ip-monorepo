import { LICENSE_TYPE_OPTIONS, PERMITTED_USE_OPTIONS } from '@repo/content-types/likeness'

export { ETHNICITY_OPTIONS, EYE_COLOR_OPTIONS, HAIR_COLOR_OPTIONS, UNION_OPTIONS } from '@repo/content-types/likeness'

type LicenseTypeOption = {
  id: string
  label: string
  description: string
  hasDropdown?: boolean
  dropdownOptions?: string[]
}

type PermittedUseOption = {
  id: string
  label: string
  description: string
}

const LICENSE_TYPE_DESCRIPTIONS: Record<string, string> = {
  'single-use':
    'Morbi in tempor magna, eu semper urna. Nam vel ex non ex accumsan viverra. Vivamus hendrerit, neque et feugiat tempus, tortor libero congue ipsum.',
  perpetual:
    'Leo ipsum, fermentum eget sagittis eu, fermentum in est. Fusce gravida ipsum eget condimentum lacinia. Sed non efficitur risus.',
}

const PERMITTED_USE_DESCRIPTIONS: Record<string, string> = {
  ai: 'Donec sagittis, nulla ac placerat facilisis, ligula mi pretium ligula, at tincidunt magna dui id nunc.',
  commercial: 'Donec sagittis, nulla ac placerat facilisis, ligula mi pretium ligula, at tincidunt magna dui id nunc.',
  digital: 'Nunc erat elit, pulvinar ut accumsan id, pretium vel lectus. Etiam Leo ipsum, fermentum.',
  'film-tv': 'Morbi in tempor magna, eu semper urna. Nam vel ex non ex accumsan viverra.',
}

export const LICENSE_TYPES: LicenseTypeOption[] = LICENSE_TYPE_OPTIONS.map((option) => ({
  id: option.value,
  label: option.label,
  description: LICENSE_TYPE_DESCRIPTIONS[option.value],
  hasDropdown: false,
}))

export const PERMITTED_USES: PermittedUseOption[] = PERMITTED_USE_OPTIONS.map((option) => ({
  id: option.value,
  label: option.label,
  description: PERMITTED_USE_DESCRIPTIONS[option.value],
}))

export const TERRITORIES = [
  'Select all',
  'Africa',
  'Asia',
  'Australia',
  'Europe',
  'North America',
  'South America',
  'United States only',
]
