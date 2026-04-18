import { type ZodType, type infer as zInfer } from "zod";

import type { REGISTER_PURPOSE } from "../entities/register/model/types";
import { verifySignedResponseIfNeeded } from "../features/security/lib/verifySignature";

const RAW_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

if (!RAW_BASE_URL) {
  throw new Error("EXPO_PUBLIC_BASE_URL is not defined");
}

const EXPO_PUBLIC_BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");

if (!__DEV__ && !EXPO_PUBLIC_BASE_URL.startsWith("https://")) {
  throw new Error(
    "EXPO_PUBLIC_BASE_URL must use HTTPS in non-development builds",
  );
}

const TIMEOUT_MS = 30_000;

type HttpMethod = "GET" | "POST";

type RequestOptionsBase = {
  method?: HttpMethod;
  body?: unknown;
  timeoutMs?: number;
  require?: boolean;
  purpose?: REGISTER_PURPOSE;
};

type RequestOptionsWithSchema<TSchema extends ZodType> = RequestOptionsBase & {
  schema: TSchema;
};

type RequestOptionsWithoutSchema = RequestOptionsBase & {
  schema?: undefined;
};

export async function http<TSchema extends ZodType>(
  path: string,
  options: RequestOptionsWithSchema<TSchema>,
): Promise<zInfer<TSchema>>;

export async function http(
  path: string,
  options?: RequestOptionsWithoutSchema,
): Promise<unknown>;

export async function http<TSchema extends ZodType>(
  path: string,
  options: RequestOptionsWithSchema<TSchema> | RequestOptionsWithoutSchema = {},
): Promise<unknown> {
  const {
    method = "POST",
    body,
    timeoutMs = TIMEOUT_MS,
    require,
    purpose,
  } = options;

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    const res = await fetch(`${EXPO_PUBLIC_BASE_URL}${normalizedPath}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body:
        method === "GET"
          ? undefined
          : body !== undefined
            ? JSON.stringify(body)
            : undefined,
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`HTTP_${res.status}`);
    }

    let json: unknown;
    try {
      json = await res.json();
    } catch {
      throw new Error("INVALID_JSON_RESPONSE");
    }

    if (!("schema" in options) || !options.schema) {
      return json;
    }

    const parsed = options.schema.safeParse(json);

    if (!parsed.success) {
      throw new Error(
        `INVALID_RESPONSE_SCHEMA: ${parsed.error.issues
          .map(
            (issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`,
          )
          .join("; ")}`,
      );
    }

    await verifySignedResponseIfNeeded({
      data: parsed.data,
      purpose,
      require,
    });

    return parsed.data;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("REQUEST_TIMEOUT");
    }

    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
