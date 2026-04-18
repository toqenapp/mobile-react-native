import {
  StartAuthMobilePayload,
  StartAuthMobileResponse,
} from "@/src/entities/auth-mobile/model/types";
import { authMobileStartResponseSchema } from "@/src/schemes/auth-mobile/response/auth-mobile-start";
import { http } from "../http";

export async function authMobileStart(
  payload: StartAuthMobilePayload,
): Promise<StartAuthMobileResponse> {
  const res = await http("/api/mobile/auth/start", {
    body: payload,
    schema: authMobileStartResponseSchema,
    require: true,
  });

  if (!res.ok) {
    throw new Error(res.reason);
  }

  return res.data.payload;
}
