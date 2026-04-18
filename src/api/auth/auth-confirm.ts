import {
  ConfirmPayload,
  ConfirmResponse,
} from "@/src/entities/auth/model/types";
import { authConfirmResponseSchema } from "@/src/schemes/auth/response/auth-confirm";
import { http } from "../http";

export async function authConfirm(
  payload: ConfirmPayload,
): Promise<ConfirmResponse> {
  const res = await http("/api/auth/qr/mobile/confirm", {
    body: payload,
    schema: authConfirmResponseSchema,
    require: true,
  });

  if (!res.ok) {
    throw new Error(res.reason);
  }

  return res.data.payload;
}
