import { z } from "zod";
import { DeviceAccessPassStatus } from "./types";

const isoDateStringSchema = z.string().datetime({ offset: true });

export const deviceAccessPassSchema = z.object({
  id: z.string().min(1).max(128),
  serviceId: z.string().min(1).max(128),
  serviceName: z.string().min(1).max(200),
  serviceIcon: z.string().min(1).max(2048),
  serviceDescription: z.string().max(500).nullable().optional(),
  createdAt: isoDateStringSchema,
  updatedAt: isoDateStringSchema.optional(),
  expiresAt: isoDateStringSchema.nullable().optional(),
  revokedAt: isoDateStringSchema.nullable().optional(),
  usageLimit: z.number().int().nonnegative().nullable(),
  usageCount: z.number().int().nonnegative().nullable(),
  status: z.enum(DeviceAccessPassStatus),
  brandColor: z.string().max(32).nullable().optional(),
});

export type DeviceAccessPass = z.infer<typeof deviceAccessPassSchema>;
