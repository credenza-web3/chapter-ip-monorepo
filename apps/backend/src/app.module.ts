import { Module, MiddlewareConsumer, RequestMethod } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { TRPCModule } from "nestjs-trpc";
import multer from "multer";
import type { Request, Response, NextFunction } from "express";

import { CommonModule } from "./common/common.module";
import { AuthModule } from "./auth/auth.module";

import { TrpcPanelController } from "./trpc-ui.controller";
import { AppRouter } from "./app.router";
import { AppContext } from "./app.context";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    MongooseModule.forRootAsync({
      imports: [],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>("MONGO_URI"),
        heartbeatFrequencyMS: 5000,
        retryAttempts: Number.MAX_VALUE,
        retryDelay: 2000,
        minPoolSize: 1,
      }),
      inject: [ConfigService],
    }),
    TRPCModule.forRoot({
      context: AppContext,
      autoSchemaFile:
        process.env.NODE_ENV === "local"
          ? "../../packages/trpc/src/server"
          : undefined,
    }),
    AuthModule,
  ],
  controllers: [TrpcPanelController],
  providers: [AppContext, AppRouter],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    const storage = multer.memoryStorage();
    const upload = multer({ storage });
    const conditionalMulter = (
      req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      const contentType = req.headers["content-type"];
      if (contentType?.includes("multipart/form-data")) {
        upload.any()(req, res, next);
      } else {
        next();
      }
    };

    consumer
      .apply(conditionalMulter)
      .forRoutes({ path: "*", method: RequestMethod.POST });
  }
}
