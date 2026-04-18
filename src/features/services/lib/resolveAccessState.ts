import {
  DeviceAccessPass,
  DeviceAccessPassStatus,
} from "@/src/entities/device-access-pass/model/types";

export function resolveAccessState(
  item: DeviceAccessPass | null,
): DeviceAccessPassStatus {
  if (!item) return DeviceAccessPassStatus.None;

  if (item.status === DeviceAccessPassStatus.Archived) {
    return DeviceAccessPassStatus.Archived;
  }

  if (item.revokedAt || item.status === DeviceAccessPassStatus.Revoked) {
    return DeviceAccessPassStatus.Revoked;
  }

  if (item.expiresAt && new Date(item.expiresAt).getTime() <= Date.now()) {
    return DeviceAccessPassStatus.Expired;
  }

  if (
    item.usageLimit !== null &&
    item.usageCount !== null &&
    item.usageCount >= item.usageLimit
  ) {
    return DeviceAccessPassStatus.Used;
  }

  return DeviceAccessPassStatus.Active;
}
