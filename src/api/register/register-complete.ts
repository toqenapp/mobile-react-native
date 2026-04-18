import {
  REGISTER_PURPOSE,
  RegisterCompleteRequest,
  RegisterCompleteResponse,
} from "@/src/entities/register/model/types";
import { registerCompleteResponseSchema } from "@/src/schemes/register/response/register-complete";
import { http } from "../http";

export async function registerComplete(
  payload: RegisterCompleteRequest,
): Promise<RegisterCompleteResponse> {
  const res = await http("/api/mobile/register/complete", {
    body: payload,
    schema: registerCompleteResponseSchema,
    require: true,
    purpose: REGISTER_PURPOSE.Complete,
  });

  if (!res.ok) {
    throw new Error(res.reason);
  }

  return res.data.payload;
}
