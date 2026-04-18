import {
    ConfirmAuthMobilePayload,
    ConfirmAuthMobileResponse,
} from "@/src/entities/auth-mobile/model/types";
import { authMobileConfirmResponseSchema } from "@/src/schemes/auth-mobile/response/auth-mobile-confirm";
import { http } from "../http";

export async function authMobileConfirm(
  payload: ConfirmAuthMobilePayload,
): Promise<ConfirmAuthMobileResponse> {
  const res = await http("/api/mobile/auth/confirm", {
    body: payload,
    schema: authMobileConfirmResponseSchema,
    require: true,
  });

  if (!res.ok) {
    throw new Error(res.reason);
  }

  return res.data.payload;
}
