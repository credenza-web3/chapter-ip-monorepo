import { DEFAULT_IMAGE_URL } from './location'

export function useDefaultImage(event: Event) {
  const image = event.currentTarget as HTMLImageElement
  if (image.src !== DEFAULT_IMAGE_URL) image.src = DEFAULT_IMAGE_URL
}
