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
    clientSecret: process.env.CLIENT_SECRET || '3fa1a513d89259f1f29181d9f2688c581cb6e3cef852d44d605350ce4537376f',
    accountsUrl: process.env.ACCOUNTS_URL || 'https://accounts.staging.credenza3.com',
    evmUrl: process.env.EVM_URL || 'https://evm.staging.credenza3.com',
  },
  evm: {
    rpcUrl: process.env.EVM_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc',
    wsUrls: ['wss://api.avax-test.network/ext/bc/C/ws', 'wss://avalanche-fuji-c-chain-rpc.publicnode.com'],
    contentNftContractAddress:
      process.env.EVM_CONTENT_NFT_CONTRACT_ADDRESS || '0x16c52fe932247c699Df03FF9525aD5bc53055dec',
    licenseNftContractAddress:
      process.env.EVM_LICENSE_NTF_CONTRACT_ADDRESS || '0x2e0D5e9F35EC0F92c5b56f2A32f18b85DB109A4D',
  },
  cloudflare: {
    r2: {
      accessKey: process.env.R2_ACCESS_KEY || '750cba49c485424cc26814e0d8821b1d',
      secretKey: process.env.R2_SECRET_KEY || '57a1eb250e67b5c477919be11d6ce649ba46dc360ed3dd68dc96f095e5f155a5',
      metadataBucketHost: process.env.R2_METADATA_BUCKET_HOST || 'https://pub-5c9112f4549643409ad80de98438b4c7.r2.dev',
    },
  },
})
