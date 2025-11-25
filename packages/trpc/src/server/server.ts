import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();
const publicProcedure = t.procedure;

const appRouter = t.router({
  app: t.router({
    health: publicProcedure.output(z.object({
      status: z.string(),
      timestamp: z.string(),
      requestId: z.string(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    authTokenPayload: publicProcedure.output(z.any()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    isClientAdmin: publicProcedure.output(z.boolean()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  auth: t.router({
    refreshToken: publicProcedure.input(z.object({
      refreshToken: z.string(),
    })).output(z.object({
      accessToken: z.string(),
      refreshToken: z.string().optional(),
      idToken: z.string().optional(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    exchangeCode: publicProcedure.input(z.object({
      code: z.string(),
      codeVerifier: z.string(),
      redirectUri: z.string(),
    })).output(z.object({
      accessToken: z.string(),
      refreshToken: z.string().optional(),
      idToken: z.string().optional(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  files: t.router({
    upload: publicProcedure.input(z.object({
      file: z.object({
        filename: z.string(),
        mimetype: z.string(),
        data: z.array(z.number()),
      }),
      tokenId: z.string(),
    })).output(z.object({
      _id: z.string(),
      key: z.string(),
      bucket: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getFileLink: publicProcedure.input(z
      .object({
        key: z.string().optional(),
        _id: z.string().optional(),
      })
      .refine((data) => Boolean(data._id || data.key), {
        message: 'Either `_id` or `key` must be provided.',
        path: ['key'],
      })).output(z.object({
        url: z.string(),
      })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getFileUploadUrl: publicProcedure.input(z.object({
      filename: z.string(),
      mimetype: z.string().optional(),
    })).output(z.object({
      url: z.string(),
      key: z.string(),
      bucket: z.string(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    registerUploadedFile: publicProcedure.input(z.object({
      key: z.string(),
      bucket: z.string(),
      tokenId: z.string(),
    })).output(z.object({
      _id: z.string(),
      key: z.string(),
      bucket: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  })
});
export type AppRouter = typeof appRouter;

