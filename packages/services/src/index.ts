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
