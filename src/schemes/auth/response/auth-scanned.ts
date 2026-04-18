import { z } from "zod";

const authScannedPayloadSchema = z.object({
  requestId: z.string().min(1).max(128),
  clientId: z.string().min(1).max(128),
  projectId: z.string().min(1).max(128),
  description: z.string().max(500).nullable().optional(),
  brandColor: z.string().max(32).nullable().optional(),
  challenge: z.string().min(1).max(2048),
  service: z.string().min(1).max(200),
  location: z.string().min(1).max(500),
  expires: z.number().int().nonnegative(),
});

const successSchema = z.object({
  ok: z.literal(true),
  data: z.object({
    payload: authScannedPayloadSchema,
    signature: z.string().min(1),
    key_id: z.string().min(1),
  }),
});

const errorSchema = z.object({
  ok: z.literal(false),
  reason: z.string().max(200),
});

export const authScannedResponseSchema = z.union([successSchema, errorSchema]);

export type AuthScannedResponse = z.infer<typeof authScannedResponseSchema>;
