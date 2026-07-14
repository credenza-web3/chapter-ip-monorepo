export * from './socket'
export * from './tx'

const env = import.meta.env.VITE_ENV || 'staging'

export const r2BaseConfig =
  env === 'prod'
    ? {
        previewUrl: 'https://pub-b3f1a770bd1e4f3d8a38569d214475c8.r2.dev',
        defaultImageUrl: 'https://pub-1a5fde2f5a814d7bbcaca6562a705028.r2.dev/chapter_ip.png',
      }
    : {
        previewUrl: 'https://pub-1a5fde2f5a814d7bbcaca6562a705028.r2.dev',
        defaultImageUrl: 'https://pub-1a5fde2f5a814d7bbcaca6562a705028.r2.dev/chapter_ip.png',
      }

// export const r2Config = {
//   url: 'https://pub-1a5fde2f5a814d7bbcaca6562a705028.r2.dev/',
//   defaultImage: 'chapter_ip.png',
// }
