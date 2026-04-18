import { deviceAccessPassSchema } from "@/src/entities/device-access-pass/model/schema";
import { z } from "zod";

const authConfirmPayloadSchema = z.object({
  accessGranted: z.boolean(),
  deviceAccessPass: deviceAccessPassSchema.nullable().optional(),
});

const successSchema = z.object({
  ok: z.literal(true),

  data: z.object({
    payload: authConfirmPayloadSchema,
    signature: z.string().min(1),
    key_id: z.string().min(1),
  }),

  reason: z.string().max(200).optional(),
});

const errorSchema = z.object({
  ok: z.literal(false),
  reason: z.string().max(200),
});

export const authConfirmResponseSchema = z.union([successSchema, errorSchema]);

export type AuthConfirmResponse = z.infer<typeof authConfirmResponseSchema>;
