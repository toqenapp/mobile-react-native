import { REGISTER_PURPOSE } from "@/src/entities/register/model/types";
import { z } from "zod";

const registerInitPayloadSchema = z.object({
  purpose: z.literal(REGISTER_PURPOSE.Init),
  registration_id: z.string().min(1).max(128),
  challenge: z.string().min(1).max(2048),
  server_now_ms: z.number().int().positive(),
  expires_at_ms: z.number().int().positive(),
});

export const registerInitSuccessSchema = z.object({
  ok: z.literal(true),
  reason: z.string().max(200).optional(),
  data: z.object({
    payload: registerInitPayloadSchema,
    signature: z.string().min(1),
    key_id: z.string().min(1),
  }),
});

export const registerInitErrorSchema = z.object({
  ok: z.literal(false),
  reason: z.string().max(200).optional(),
});

export const registerInitResponseSchema = z.union([
  registerInitSuccessSchema,
  registerInitErrorSchema,
]);

export type RegisterInitResponse = z.infer<typeof registerInitResponseSchema>;
export type RegisterInitSignedData = z.infer<
  typeof registerInitSuccessSchema
>["data"];
export type RegisterInitPayload = z.infer<typeof registerInitPayloadSchema>;
