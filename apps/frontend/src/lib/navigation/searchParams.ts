export function urlWithSearchParams(pathname: string, searchParams: URLSearchParams, hash = ''): string {
  const query = searchParams.toString()
  return `${pathname}${query ? `?${query}` : ''}${hash}`
}

export function currentUrlWithSearchParams(searchParams: URLSearchParams): string {
  return urlWithSearchParams(window.location.pathname, searchParams, window.location.hash)
}
