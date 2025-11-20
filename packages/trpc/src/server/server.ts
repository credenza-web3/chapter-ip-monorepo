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
  })
});
export type AppRouter = typeof appRouter;

