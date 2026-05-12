export const ETHNICITY_OPTIONS = [
  { value: 'hispanic_or_latino', label: 'Hispanic or Latino' },
  { value: 'white_or_caucasian', label: 'White or Caucasian' },
  { value: 'black_or_african_american', label: 'Black or African American' },
  { value: 'native_hawaiian_or_other_pacific_islander', label: 'Native Hawaiian or Other Pacific Islander' },
  { value: 'asian', label: 'Asian' },
  { value: 'american_indian_or_alaska_native', label: 'American Indian or Alaska Native' },
  { value: 'other', label: 'Other (prefer to self-identify)' },
] as const

export const EYE_COLOR_OPTIONS = [
  { value: 'gray', label: 'Gray' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'hazel', label: 'Hazel' },
  { value: 'amber', label: 'Amber' },
  { value: 'brown', label: 'Brown' },
] as const

export const HAIR_COLOR_OPTIONS = [
  { value: 'black', label: 'Black' },
  { value: 'brown', label: 'Brown' },
  { value: 'auburn', label: 'Auburn' },
  { value: 'red', label: 'Red' },
  { value: 'blonde', label: 'Blonde' },
  { value: 'gray', label: 'Gray' },
  { value: 'white', label: 'White' },
] as const

export const UNION_OPTIONS = [
  { value: 'SAG-AFTRA', label: 'SAG-AFTRA' },
  { value: 'AEA', label: 'AEA' },
  { value: 'IATSE', label: 'IATSE' },
  { value: 'AFM', label: 'AFM' },
  { value: 'WGA', label: 'WGA' },
  { value: 'DGA', label: 'DGA' },
] as const

export const LICENSE_TYPES = [
  {
    id: 'single-use',
    label: 'Single-use campaign',
    description:
      'Morbi in tempor magna, eu semper urna. Nam vel ex non ex accumsan viverra. Vivamus hendrerit, neque et feugiat tempus, tortor libero congue ipsum.',
    hasDropdown: false,
  },
  {
    id: 'time-limited',
    label: 'Time-limited commercial',
    description:
      'Sed hendrerit libero vitae sem tristique auctor. Etiam quis quam rhoncus, vehicula ligula ut, congue nibh. Nunc condimentum',
    hasDropdown: true,
    dropdownOptions: ['1 year', '6 months', '3 months', '1 month'],
  },
  {
    id: 'perpetual',
    label: 'Perpetual brand ambassador',
    description:
      'Leo ipsum, fermentum eget sagittis eu, fermentum in est. Fusce gravida ipsum eget condimentum lacinia. Sed non efficitur risus.',
    hasDropdown: true,
    dropdownOptions: ['Ongoing', 'One brand', 'Annual', 'One-time fee'],
  },
  {
    id: 'ai-digital',
    label: 'AI/Digital twin',
    description:
      'Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Phasellus lorem Leo, porttitor id cursus vel, aliquet vel orci.',
    hasDropdown: false,
  },
  {
    id: 'bulk',
    label: 'Bulk clean list',
    description:
      'Vivamus aliquet ultricies dolor, at feugiat libero ultricies quis. Nam convallis elit eget ipsum gravida, sed lobortis urna consequat.',
    hasDropdown: true,
    dropdownOptions: ['Enterprise', 'Per-member', 'Flat-fee'],
  },
]

export const PERMITTED_USES = [
  {
    id: 'ai',
    label: 'AI (Artificial Intelligence)',
    description:
      'Donec sagittis, nulla ac placerat facilisis, ligula mi pretium ligula, at tincidunt magna dui id nunc.',
  },
  {
    id: 'commercial',
    label: 'Commercial',
    description:
      'Donec sagittis, nulla ac placerat facilisis, ligula mi pretium ligula, at tincidunt magna dui id nunc.',
  },
  {
    id: 'digital',
    label: 'Digital',
    description: 'Nunc erat elit, pulvinar ut accumsan id, pretium vel lectus. Etiam Leo ipsum, fermentum.',
  },
  {
    id: 'film-tv',
    label: 'Film/TV',
    description: 'Morbi in tempor magna, eu semper urna. Nam vel ex non ex accumsan viverra.',
  },
  {
    id: 'print',
    label: 'Print',
    description: 'Integer velit tortor, bibendum sit amet efficitur vitae, tristique a nibh.',
  },
]

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
