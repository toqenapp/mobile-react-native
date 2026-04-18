import {
    AuthManualCodePayload,
    AuthManualCodeResponse,
} from "@/src/entities/auth/model/types";
import { authManualCodeResponseSchema } from "@/src/schemes/auth/response/auth-manual-code";
import { http } from "../http";

export async function authManualCode(
  payload: AuthManualCodePayload,
): Promise<AuthManualCodeResponse> {
  const res = await http("/api/auth/qr/mobile/manual-code", {
    body: payload,
    schema: authManualCodeResponseSchema,
    require: true,
  });

  if (!res.ok) {
    throw new Error(res.reason);
  }

  return res.data.payload;
}
