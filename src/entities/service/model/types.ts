import { DeviceAccessPass } from "../../device-access-pass/model/types";

export type ServiceItem = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  description?: string | null;
  brandColor?: string | null;
  launchUrl?: string;
  loginUrl: string;
  clientId: string;
  redirectUri: string;
};

export type ServiceSyncItem = ServiceItem & {
  updatedAt: string;
};

export type ServiceWithAccess = {
  service: ServiceItem;
  deviceAccessPass: DeviceAccessPass | null;
};

export type ServicesSyncPayload = {
  currentVersion?: number | null;
  cursor?: string | null;
};

export type ServicesSyncResponse = {
  version: number;
  changed: boolean;
  upserts: ServiceSyncItem[];
  deletes: string[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type ListLocalServicesParams = {
  limit?: number;
  offset?: number;
  query?: string;
};

export type LocalServicesMeta = {
  version: number;
  lastCheckAt: number | null;
  totalCount: number;
};
