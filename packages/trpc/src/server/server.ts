import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { createPaginatedResponseSchema } from "../../../../apps/backend/src/common/model/model.dto";
import { createPaginatedResponseSchema } from "../../../../apps/backend/src/common/model/model.dto";

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
    createContentUploadUrl: publicProcedure.input(z.object({
      tokenId: z.string(),
      mimetype: z.string(),
      extension: z.string().optional(),
    })).output(z.object({
      url: z.string(),
      key: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    registerContent: publicProcedure.input(z.object({
      key: z.string(),
      tokenId: z.string(),
    })).output(z.object({
      id: z.string(),
      sub: z.string(),
      bucket: z.string(),
      key: z.string(),
      tokenId: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findContent: publicProcedure.input(z.object({
      id: z.string().optional(),
      limit: z.string().optional(),
      cursor: z.string().optional(),
      sort: z.string().optional(),
      order: z.enum(['asc', 'desc']).optional().default('desc'),
      startCreatedAt: z.string().optional(),
      endCreatedAt: z.string().optional(),
      startUpdatedAt: z.string().optional(),
      endUpdatedAt: z.string().optional(),
    }).extend({
      sub: z.string().optional(),
      tokenId: z.string().optional(),
      key: z.string().optional(),
    })).output(createPaginatedResponseSchema(z.object({
      id: z.string(),
      sub: z.string(),
      bucket: z.string(),
      key: z.string(),
      tokenId: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getContentLink: publicProcedure.input(z
      .object({
        key: z.string().optional(),
        id: z.string().optional(),
        licenseTokenId: z.string().optional(),
      })
      .refine((data) => Boolean(data.id || data.key), {
        message: 'Either `id` or `key` must be provided.',
        path: ['key'],
      })).output(z.object({
        url: z.string(),
      })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    uploadMetadata: publicProcedure.input(z.object({
      tokenId: z.string(),
      metadata: z
        .object({})
        .catchall(z.any())
        .refine((obj) => Object.keys(obj).length > 0, {
          message: `'metadata' object cannot be empty`,
        }),
    })).output(z.object({
      url: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  publishers: t.router({
    setPublisher: publicProcedure.input(z.object({
      title: z.string(),
      avatarUrl: z.string().optional(),
    })).output(z.object({
      id: z.string(),
      sub: z.string(),
      title: z.string(),
      avatarUrl: z.string().optional(),
      createdAt: z.date(),
      updatedAt: z.date(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getPublisher: publicProcedure.input(z
      .object({
        sub: z.string().optional(),
        id: z.string().optional(),
      })
      .refine((data) => Boolean(data.id || data.sub), {
        message: 'Either `_id` or `sub` must be provided.',
        path: ['sub'],
      })).output(z.object({
        id: z.string(),
        sub: z.string(),
        title: z.string(),
        avatarUrl: z.string().optional(),
        createdAt: z.date(),
        updatedAt: z.date(),
      })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findPublishers: publicProcedure.input(z.object({
      id: z.string().optional(),
      limit: z.string().optional(),
      cursor: z.string().optional(),
      sort: z.string().optional(),
      order: z.enum(['asc', 'desc']).optional().default('desc'),
      startCreatedAt: z.string().optional(),
      endCreatedAt: z.string().optional(),
      startUpdatedAt: z.string().optional(),
      endUpdatedAt: z.string().optional(),
    }).extend({
      title: z.string().optional(),
      sub: z.string().optional(),
    })).output(createPaginatedResponseSchema(z.object({
      id: z.string(),
      sub: z.string(),
      title: z.string(),
      avatarUrl: z.string().optional(),
      createdAt: z.date(),
      updatedAt: z.date(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  })
});
export type AppRouter = typeof appRouter;

