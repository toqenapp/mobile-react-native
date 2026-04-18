import { REGISTER_PURPOSE } from "@/src/entities/register/model/types";
import { p256 } from "@noble/curves/nist.js";

type VerifyServerSignatureParams = {
  payloadString: string;
  signature: string;
  publicKey: string;
};

type VerifySignedResponseIfNeededParams = {
  data: unknown;
  purpose?: REGISTER_PURPOSE;
  require?: boolean;
};

const SERVER_PUBLIC_KEYS: Record<string, string> = {
  v1: "BH_lIbIW4imbN68JW27e0uuJA4feroEOZWML6AujJE000I3Irgu_TVuBlrqk0vmjbhwgxHtVbe8OjnAGTpBPIwE",
};

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padLength);

  const binary = globalThis.atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val)}`);

  return `{${entries.join(",")}}`;
}

function verifyServerSignature({
  payloadString,
  signature,
  publicKey,
}: VerifyServerSignatureParams): boolean {
  const message = new TextEncoder().encode(payloadString);
  const signatureBytes = base64UrlToBytes(signature);
  const publicKeyBytes = base64UrlToBytes(publicKey);

  return p256.verify(signatureBytes, message, publicKeyBytes, {
    format: "der",
    lowS: false,
  });
}

export async function verifySignedResponseIfNeeded(
  params: VerifySignedResponseIfNeededParams,
): Promise<Record<string, unknown> | null> {
  const { data, purpose, require } = params;

  if (!data || typeof data !== "object" || !("data" in data)) {
    if (require) {
      throw new Error("SIGNED_RESPONSE_REQUIRED");
    }
    return null;
  }
  const signedContainer = (data as { data?: unknown }).data;

  if (!signedContainer || typeof signedContainer !== "object") {
    if (require) {
      throw new Error("SIGNED_RESPONSE_REQUIRED");
    }
    return null;
  }

  const signed = signedContainer as {
    payload?: Record<string, unknown>;
    signature?: string;
    key_id?: string;
  };

  if (!signed.payload || !signed.signature || !signed.key_id) {
    if (require) {
      throw new Error("SIGNED_RESPONSE_REQUIRED");
    }
    return null;
  }

  const publicKey = SERVER_PUBLIC_KEYS[signed.key_id];

  if (!publicKey) {
    throw new Error("UNKNOWN_SERVER_KEY");
  }

  const ok = verifyServerSignature({
    payloadString: stableStringify(signed.payload),
    signature: signed.signature,
    publicKey,
  });

  if (!ok) {
    throw new Error("INVALID_SERVER_SIGNATURE");
  }

  if (purpose && signed.payload.purpose !== purpose) {
    throw new Error("SIGNED_SERVER_PAYLOAD_PURPOSE_MISMATCH");
  }

  return signed.payload;
}
