import { normalizeExpiresAtMs } from "./requestGuards";

type ToqenQR = {
  requestId: string;
  nonce: string;
  expiresAtMs: number;
  service: string;
};

const MAX_SERVICE_LENGTH = 80;
const MAX_NONCE_LENGTH = 64;
const MAX_REQUEST_ID_LENGTH = 64;

export function parseToqenQR(data: string): ToqenQR | null {
  try {
    if (!data.startsWith("toqenapp://auth")) return null;

    const url = new URL(data);

    if (url.protocol !== "toqenapp:") return null;

    const requestId = url.searchParams.get("request_id");
    const nonce = url.searchParams.get("nonce");
    const expiresRaw = url.searchParams.get("expires");
    const service = url.searchParams.get("service");

    if (!requestId || !nonce || !expiresRaw || !service) {
      return null;
    }

    if (requestId.length > MAX_REQUEST_ID_LENGTH) return null;
    if (nonce.length > MAX_NONCE_LENGTH) return null;
    if (service.length > MAX_SERVICE_LENGTH) return null;

    const expiresNumber = Number(expiresRaw);

    if (!Number.isFinite(expiresNumber)) return null;

    const expiresAtMs = normalizeExpiresAtMs(expiresNumber);

    if (!expiresAtMs) return null;

    return {
      requestId,
      nonce,
      expiresAtMs,
      service,
    };
  } catch {
    return null;
  }
}
