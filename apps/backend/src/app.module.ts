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

const trpcErrorLogger = new Logger('TRPC Error')

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    MongooseModule.forRootAsync({
      imports: [],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return shape
      },
    }),
    AuthModule,
    FileModule,
    PublisherModule,
    LicenseModule,
  ],
  controllers: [TrpcPanelController],
  providers: [AppContext, AppRouter],
})
export class AppModule {}
