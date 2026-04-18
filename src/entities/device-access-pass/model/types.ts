export enum PendingStage {
  Starting = "Starting",
  Preparing = "Preparing",
  Cancelling = "Cancelling",
  Opening = "Opening",
}

export enum DeviceAccessPassStatus {
  None = "none",
  Active = "active",
  Expired = "expired",
  Used = "used",
  Revoked = "revoked",
  Archived = "archived",
}

export type DeviceAccessPass = {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceIcon: string;
  serviceDescription?: string | null;
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string | null;
  revokedAt?: string | null;
  usageLimit: number | null; // null = unlimited
  usageCount: number | null;
  status: DeviceAccessPassStatus;
  brandColor?: string | null;
};
