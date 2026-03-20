export const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

export const formatKM = (value: number) => {
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1) + ' M'
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1) + ' K'
  }

  return value.toString()
}
