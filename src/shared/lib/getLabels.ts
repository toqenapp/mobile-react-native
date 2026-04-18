import { DeviceAccessPassStatus } from "@/src/entities/device-access-pass/model/types";

export function getLabels(state: DeviceAccessPassStatus) {
  switch (state) {
    case DeviceAccessPassStatus.Active:
      return {
        action: "Access",
        status: "Active",
        actionColor: "text-accent-700",
        actionColorService: "text-info-700",
      };

    case DeviceAccessPassStatus.Expired:
      return {
        action: "Renew",
        status: "Expired",
        actionColor: "text-info-700",
      };

    case DeviceAccessPassStatus.Used:
      return {
        action: "Renew",
        status: "Used",
        actionColor: "text-info-700",
      };

    case DeviceAccessPassStatus.Revoked:
      return {
        action: "Request",
        status: "Revoked",
        actionColor: "text-warning-800/80",
      };

    case DeviceAccessPassStatus.Archived:
      return {
        action: "Restore",
        status: "Archived",
        actionColor: "text-gray-300",
      };

    case DeviceAccessPassStatus.None:
    default:
      return {
        action: "Sign in",
        status: null,
        actionColor: "text-info-700",
      };
  }
}
