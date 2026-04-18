import {
    ServicesSyncPayload,
    ServicesSyncResponse,
} from "@/src/entities/service/model/types";
import { servicesSyncResponseSchema } from "@/src/schemes/services/response/sync";
import { http } from "../http";

export async function servicesSync(
  payload: ServicesSyncPayload,
): Promise<ServicesSyncResponse> {
  const res = await http("/api/mobile/services/sync", {
    body: payload,
    schema: servicesSyncResponseSchema,
    require: true,
  });

  if (!res.ok) {
    throw new Error(res.reason);
  }

  return res.data.payload;
}
