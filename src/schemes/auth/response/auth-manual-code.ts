import { z } from "zod";

const authManualCodePayloadSchema = z.object({
  requestId: z.string().min(1).max(128),
  clientId: z.string().min(1).max(128),
  projectId: z.string().min(1).max(128),
  challenge: z.string().min(1).max(2048),
  service: z.string().min(1).max(200),
  location: z.string().min(1).max(500),
  expires: z.number().int().nonnegative(),
  nonce: z.string().min(1).max(256),
});

const successSchema = z.object({
  ok: z.literal(true),
  data: z.object({
    payload: authManualCodePayloadSchema,
    signature: z.string().min(1),
    key_id: z.string().min(1),
  }),
});

const errorSchema = z.object({
  ok: z.literal(false),
  reason: z.string().max(200),
});

export const authManualCodeResponseSchema = z.union([
  successSchema,
  errorSchema,
]);

export type AuthManualCodeResponse = z.infer<
  typeof authManualCodeResponseSchema
>;
