import { r2Config } from '@repo/fe-services'

export const DEFAULT_IMAGE_URL = r2Config.url + r2Config.defaultImage

export function useDefaultImage(event: Event) {
  const image = event.currentTarget as HTMLImageElement
  if (image.src !== DEFAULT_IMAGE_URL) image.src = DEFAULT_IMAGE_URL
}
