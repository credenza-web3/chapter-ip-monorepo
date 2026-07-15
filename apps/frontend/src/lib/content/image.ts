import { r2BaseConfig } from '@repo/fe-services'

export const DEFAULT_IMAGE_URL = r2BaseConfig.defaultImageUrl

export function useDefaultImage(event: Event) {
  const image = event.currentTarget as HTMLImageElement
  if (image.src !== DEFAULT_IMAGE_URL) image.src = DEFAULT_IMAGE_URL
}
