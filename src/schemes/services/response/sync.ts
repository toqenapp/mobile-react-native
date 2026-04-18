import { z } from "zod";

const serviceItemSchema = z.object({
  id: z.string().min(1).max(128),
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(128),
  logoUrl: z.string().max(2048).nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  brandColor: z.string().max(32).nullable().optional(),
  launchUrl: z.string().max(2048).optional(),
  loginUrl: z.string().min(1).max(2048),
  clientId: z.string().min(1).max(128),
  redirectUri: z.string().min(1).max(2048),
});

const serviceSyncItemSchema = serviceItemSchema.extend({
  updatedAt: z.string().min(1).max(64),
});

const servicesSyncPayloadSchema = z.object({
  version: z.number().int().nonnegative(),
  changed: z.boolean(),
  upserts: z.array(serviceSyncItemSchema),
  deletes: z.array(z.string().min(1).max(128)),
  nextCursor: z.string().min(1).max(256).nullable(),
  hasMore: z.boolean(),
});

const successSchema = z.object({
  ok: z.literal(true),

  data: z.object({
    payload: servicesSyncPayloadSchema,
    signature: z.string().min(1),
    key_id: z.string().min(1),
  }),
});

const errorSchema = z.object({
  ok: z.literal(false),
  reason: z.string().max(200),
});

export const servicesSyncResponseSchema = z.union([successSchema, errorSchema]);

export type ServicesSyncResponse = z.infer<typeof servicesSyncResponseSchema>;
