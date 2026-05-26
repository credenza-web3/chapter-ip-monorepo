export function getMenuItems(contentId: string) {
  return [
    // {
    //   text: 'View listing',
    //   href: '/authed/files',
    // },
    {
      text: 'Edit listing',
      href: `/authed/files/${contentId}`,
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
