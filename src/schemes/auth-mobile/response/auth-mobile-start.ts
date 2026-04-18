import { z } from "zod";

const authMobileStartPayloadSchema = z.object({
  auth_request_id: z.string().min(1).max(128),
  challenge: z.string().min(1).max(2048),
  client_id: z.string().min(1).max(128),
  service_name: z.string().max(200).nullable().optional(),
  finish_token: z.string().min(1).max(512),
});

const successSchema = z.object({
  ok: z.literal(true),

  data: z.object({
    payload: authMobileStartPayloadSchema,
    signature: z.string().min(1),
    key_id: z.string().min(1),
  }),

  reason: z.string().max(200).optional(),
});

const errorSchema = z.object({
  ok: z.literal(false),
  reason: z.string().max(200),
});

export const authMobileStartResponseSchema = z.union([
  successSchema,
  errorSchema,
]);

export type AuthMobileStartResponse = z.infer<
  typeof authMobileStartResponseSchema
>;
