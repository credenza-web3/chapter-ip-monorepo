export const ETHNICITY_OPTIONS = [
  { value: 0, label: '1' },
  { value: 1, label: '2' },
  { value: 2, label: '3' },
  { value: 3, label: '4' },
] as const

export const LICENSE_TYPES = [
  {
    id: 'single-use',
    label: 'Single-use campaign',
    description: 'Morbi in tempor magna, eu semper urna. Nam vel ex non ex accumsan viverra. Vivamus hendrerit, neque et feugiat tempus, tortor libero congue ipsum.',
    hasDropdown: false,
  },
  {
    id: 'time-limited',
    label: 'Time-limited commercial',
    description: 'Sed hendrerit libero vitae sem tristique auctor. Etiam quis quam rhoncus, vehicula ligula ut, congue nibh. Nunc condimentum',
    hasDropdown: true,
    dropdownOptions: ['1 Year', '2 Years', '3 Years'],
  },
  {
    id: 'perpetual',
    label: 'Perpetual brand ambassador',
    description: 'Leo ipsum, fermentum eget sagittis eu, fermentum in est. Fusce gravida ipsum eget condimentum lacinia. Sed non efficitur risus.',
    hasDropdown: true,
    dropdownOptions: ['Annual', 'Monthly'],
  },
  {
    id: 'ai-digital',
    label: 'AI/Digital twin',
    description: 'Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Phasellus lorem Leo, porttitor id cursus vel, aliquet vel orci.',
    hasDropdown: false,
  },
  {
    id: 'bulk',
    label: 'Bulk clean list',
    description: 'Vivamus aliquet ultricies dolor, at feugiat libero ultricies quis. Nam convallis elit eget ipsum gravida, sed lobortis urna consequat.',
    hasDropdown: true,
    dropdownOptions: ['Member', 'Non-member'],
  },
]

export const PERMITTED_USES = [
  { id: 'ai', label: 'AI (Artificial Intelligence)', description: 'Donec sagittis, nulla ac placerat facilisis, ligula mi pretium ligula, at tincidunt magna dui id nunc.' },
  { id: 'commercial', label: 'Commercial', description: 'Donec sagittis, nulla ac placerat facilisis, ligula mi pretium ligula, at tincidunt magna dui id nunc.' },
  { id: 'digital', label: 'Digital', description: 'Nunc erat elit, pulvinar ut accumsan id, pretium vel lectus. Etiam Leo ipsum, fermentum.' },
  { id: 'film-tv', label: 'Film/TV', description: 'Morbi in tempor magna, eu semper urna. Nam vel ex non ex accumsan viverra.' },
  { id: 'print', label: 'Print', description: 'Integer velit tortor, bibendum sit amet efficitur vitae, tristique a nibh.' },
]

export const TERRITORIES = ['Select all', 'Africa', 'Asia', 'Australia', 'Europe', 'North America', 'South America', 'United States only']