export * from './socket'
export * from './tx'

const env = import.meta.env.VITE_ENV || 'staging'

export const r2BaseConfig =
  env === 'prod'
    ? {
        previewUrl: 'https://preview.files.chapterip.com',
        defaultImageUrl: 'https://preview.files.test.chapterip.com/chapter_ip.png',
        userFilesUrl: 'https://userfiles.files.chapterip.com',
      }
    : {
        previewUrl: 'https://preview.files.test.chapterip.com',
        defaultImageUrl: 'https://preview.files.test.chapterip.com/chapter_ip.png',
        userFilesUrl: 'https://userfiles.files.test.chapterip.com',
      }

// export const r2Config = {
//   url: 'https://pub-1a5fde2f5a814d7bbcaca6562a705028.r2.dev/',
//   defaultImage: 'chapter_ip.png',
// }
