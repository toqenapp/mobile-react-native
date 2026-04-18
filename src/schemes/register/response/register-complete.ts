import { REGISTER_PURPOSE } from "@/src/entities/register/model/types";
import { z } from "zod";

const registerCompletePayloadSchema = z.object({
  purpose: z.literal(REGISTER_PURPOSE.Complete),
  registration_id: z.string().min(1).max(128),
  device_id: z.string().min(1).max(128),
  device_public_key: z.string().min(1).max(512),
  registered_at_ms: z.number().int().positive(),
});

export const registerCompleteSuccessSchema = z.object({
  ok: z.literal(true),
  data: z.object({
    payload: registerCompletePayloadSchema,
    signature: z.string().min(1),
    key_id: z.string().min(1),
  }),
});

export const registerCompleteErrorSchema = z.object({
  ok: z.literal(false),
  reason: z.string().max(200).optional(),
});

export const registerCompleteResponseSchema = z.union([
  registerCompleteSuccessSchema,
  registerCompleteErrorSchema,
]);

export type RegisterCompleteResponse = z.infer<
  typeof registerCompleteResponseSchema
>;
export type RegisterCompleteSignedData = z.infer<
  typeof registerCompleteSuccessSchema
>["data"];
export type RegisterCompletePayload = z.infer<
  typeof registerCompletePayloadSchema
>;
