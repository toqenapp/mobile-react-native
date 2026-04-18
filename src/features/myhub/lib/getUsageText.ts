import { DeviceAccessPass } from "@/src/entities/device-access-pass/model/types";

export function getUsageText(pass: DeviceAccessPass) {
  if (pass.usageLimit == null) return null;
  return `${pass.usageCount} / ${pass.usageLimit} uses`;
}
