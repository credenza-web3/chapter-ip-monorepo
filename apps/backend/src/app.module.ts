import { Module, Logger } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { TRPCModule } from 'nestjs-trpc'

import { CommonModule } from './common/common.module'
import { AuthModule } from './auth/auth.module'
import { FileModule } from './file/file.module'
import { PublisherModule } from './publisher/publisher.module'
import { LicenseModule } from './license/license.module'

import { TrpcPanelController } from './trpc-ui.controller'
import { AppRouter } from './app.router'
import { AppContext } from './app.context'
import { EvmListenerModule } from './evm-listener/evm-listener.module'

import defaultConfig, { getEnv, ENV } from './app.config/default'
import stagingConfig from './app.config/staging'
import prodConfig from './app.config/prod'

const trpcErrorLogger = new Logger('TRPC Error')
const env: string = getEnv()

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [defaultConfig, ...(env === ENV.STAGING ? [stagingConfig] : []), ...(env === ENV.PROD ? [prodConfig] : [])],
    }),
    CommonModule,
    MongooseModule.forRootAsync({
      imports: [],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongo.uri'),
        heartbeatFrequencyMS: 5000,
        retryAttempts: Number.MAX_VALUE,
        retryDelay: 2000,
        minPoolSize: 1,
      }),
      inject: [ConfigService],
    }),
    TRPCModule.forRoot({
      context: AppContext,
      // autoSchemaFile: process.env.NODE_ENV === 'local' ? '../../packages/trpc/src/server' : undefined,
      errorFormatter: ({ shape, error }) => {
        trpcErrorLogger.error(error)

        return shape
      },
    }),
    AuthModule,
    FileModule,
    PublisherModule,
    LicenseModule,
    EvmListenerModule,
  ],
  controllers: [TrpcPanelController],
  providers: [AppContext, AppRouter],
})
export class AppModule {}
