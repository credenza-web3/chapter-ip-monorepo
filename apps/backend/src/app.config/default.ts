export const ENV = {
  LOCAL: 'local',
  STAGING: 'staging',
  PROD: 'prod',
} as const

export function getEnv(): string {
  return process.env.NODE_ENV || ENV.LOCAL
}

export default () => ({
  env: getEnv(),
  port: process.env.PORT || 8060,
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/chapter_ip_local?replicaSet=rs0',
  },
  credenza3: {
    clientId: process.env.CLIENT_ID || '66a36001a7152aa7d6f9e135',
    clientSecret: process.env.CLIENT_SECRET,
    accountsUrl: 'https://accounts.staging.credenza3.com',
    evmUrl: 'https://evm.staging.credenza3.com',
  },
  evm: {
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    wsUrls: ['wss://api.avax-test.network/ext/bc/C/ws', 'wss://avalanche-fuji-c-chain-rpc.publicnode.com'],
    contentNftContractAddress: '0x16c52fe932247c699Df03FF9525aD5bc53055dec',
    licenseNftContractAddress: '0x2e0D5e9F35EC0F92c5b56f2A32f18b85DB109A4D',
    membershipContractAddress: '0xCbE52ed30E0841429262d5876a1d4eB9a7f1ED46',
  },
  cloudflare: {
    r2: {
      accessKey: process.env.R2_ACCESS_KEY,
      secretKey: process.env.R2_SECRET_KEY,
      metadataBucketHost: process.env.R2_METADATA_BUCKET_HOST || 'https://pub-5c9112f4549643409ad80de98438b4c7.r2.dev',
    },
  },
})
