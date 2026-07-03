export function getMenuItems(contentId: string, contentType?: string) {
  const type = String(contentType ?? '').toLowerCase()
  const editHref = type.includes('likeness')
    ? `/authed/likeness/${contentId}`
    : type.includes('location')
      ? `/authed/locations/${contentId}`
      : `/authed/files/${contentId}`

  return [
    // {
    //   text: 'View listing',
    //   href: '/authed/files',
    // },
    {
      text: 'Edit listing',
      href: editHref,
    },
    // {
    //   text: 'Set as draft',
    //   href: '/authed/files',
    // },
    // {
    //   text: 'Deactivate listing',
    //   href: '/authed/files',
    // },
    {
      text: 'View history',
      href: '/authed/history',
    },
  ]
}
