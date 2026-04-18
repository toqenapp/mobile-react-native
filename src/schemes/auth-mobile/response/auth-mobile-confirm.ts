import { LaunchMode } from "@/src/entities/auth-mobile/model/types";
import { deviceAccessPassSchema } from "@/src/entities/device-access-pass/model/schema";
import { z } from "zod";

const authMobileConfirmPayloadSchema = z.object({
  accessGranted: z.boolean(),
  launch_mode: z.enum(LaunchMode),
  launch_url: z.string().min(1).max(2048),
  deviceAccessPass: deviceAccessPassSchema.nullable().optional(),
});

const successSchema = z.object({
  ok: z.literal(true),

  data: z.object({
    payload: authMobileConfirmPayloadSchema,
    signature: z.string().min(1),
    key_id: z.string().min(1),
  }),

  reason: z.string().max(200).optional(),
});

const errorSchema = z.object({
  ok: z.literal(false),
  reason: z.string().max(200),
});

export const authMobileConfirmResponseSchema = z.union([
  successSchema,
  errorSchema,
]);

export type AuthMobileConfirmResponse = z.infer<
  typeof authMobileConfirmResponseSchema
>;
