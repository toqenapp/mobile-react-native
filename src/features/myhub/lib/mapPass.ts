import { DeviceAccessPass } from "@/src/entities/device-access-pass/model/types";

export function mapPass(input: DeviceAccessPass): DeviceAccessPass {
  return {
    id: input.id,
    serviceId: input.serviceId,
    serviceName: input.serviceName,
    serviceIcon: input.serviceIcon,
    serviceDescription: input.serviceDescription,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
    expiresAt: input.expiresAt,
    revokedAt: input.revokedAt,
    usageLimit: input.usageLimit,
    usageCount: input.usageCount,
    status: input.status,
    brandColor: input.brandColor ?? null,
  };
}
