import {
    AuthScannedPayload,
    AuthScannedResponse,
} from "@/src/entities/auth/model/types";
import { authScannedResponseSchema } from "@/src/schemes/auth/response/auth-scanned";
import { http } from "../http";

export async function authScanned(
  payload: AuthScannedPayload,
): Promise<AuthScannedResponse> {
  const res = await http("/api/auth/qr/mobile/scanned", {
    body: payload,
    schema: authScannedResponseSchema,
    require: true,
  });

  if (!res.ok) {
    throw new Error(res.reason);
  }

  return res.data.payload;
}
