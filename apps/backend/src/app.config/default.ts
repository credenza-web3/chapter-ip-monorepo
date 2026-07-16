import { withEnvOverrides } from '../common/utils/utils'

export const ENV = {
  LOCAL: 'local',
  STAGING: 'staging',
  PROD: 'prod',
} as const

export function getEnv(): string {
  return process.env.NODE_ENV || ENV.LOCAL
}

const config = {
  env: getEnv(),
  port: 8060,
  mongo: {
    uri: 'mongodb://localhost:27017/chapter_ip_local?replicaSet=rs0',
  },
  credenza: {
    clientId: '66a36001a7152aa7d6f9e135',
    clientSecret: '',
    accountsUrl: 'https://accounts.staging.credenza3.com',
    evmUrl: 'https://evm.staging.credenza3.com',
  },
  evm: {
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    wsUrls: ['wss://api.avax-test.network/ext/bc/C/ws', 'wss://avalanche-fuji-c-chain-rpc.publicnode.com'],
    contentNftContractAddress: '0xC748855724179Ab0c0Fb5d196f2926A152AAea5c',
    licenseNftContractAddress: '0xBF2268a14D7f2024EFcf1f4cb2F8ab9f8AE5b6d6',
    membershipContractAddress: '0xCbE52ed30E0841429262d5876a1d4eB9a7f1ED46',
  },
  cloudflare: {
    rtwo: {
      accessKeyId: '',
      secretAccessKey: '',
      metadataBucketHost: 'https://pub-5c9112f4549643409ad80de98438b4c7.r2.dev',
    },
  },
  license: {
    oneTimeLinkActiveHours: 72,
  },
}

export default () => withEnvOverrides(config)
