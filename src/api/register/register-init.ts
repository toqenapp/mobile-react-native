import {
  REGISTER_PURPOSE,
  RegisterInitResponse,
} from "@/src/entities/register/model/types";
import { registerInitResponseSchema } from "@/src/schemes/register/response/register-init";
import { http } from "../http";

export async function registerInit(): Promise<RegisterInitResponse> {
  const res = await http("/api/mobile/register/init", {
    schema: registerInitResponseSchema,
    require: true,
    purpose: REGISTER_PURPOSE.Init,
  });

  if (!res.ok) {
    throw new Error(res.reason);
  }

  return res.data.payload;
}
