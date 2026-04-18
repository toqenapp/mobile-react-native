import { useCallback, useEffect, useRef, useState } from "react";
import { Linking } from "react-native";

import { api } from "@/src/api";
import { Approved, Locale } from "@/src/entities/common";
import { PendingStage } from "@/src/entities/device-access-pass/model/types";
import { ServiceItem } from "@/src/entities/service/model/types";
import { deviceKey } from "@/src/providers/device-key";
import { useAccessPassStore } from "@/src/store/accessPassStore";
import { mapPass } from "../../myhub/lib/mapPass";

type UseServiceAccessActionResult = {
  pendingId: string | null;
  pendingStage: PendingStage | null;
  resultMessage: string | null;
  clearResultMessage: () => void;
  openOrSignIn: (service?: ServiceItem) => Promise<void>;
};

const ALLOWED_RUNTIME_LAUNCH_QUERY_PARAMS = new Set([
  "code",
  "state",
  "iss",
  "session_state",
  "session_grant",
]);

function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function normalizeProtocol(protocol: string): string {
  return protocol.trim().toLowerCase();
}

function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase();
}

function normalizePort(url: URL): string {
  if (url.port) return url.port;

  const protocol = normalizeProtocol(url.protocol);

  if (protocol === "https:") return "443";
  if (protocol === "http:") return "80";

  return "";
}

function isPrivateIPv4(hostname: string): boolean {
  const parts = hostname.split(".").map(Number);

  if (
    parts.length !== 4 ||
    parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)
  ) {
    return false;
  }

  const [a, b] = parts;

  return (
    a === 10 ||
    a === 127 ||
    (a === 192 && b === 168) ||
    (a === 172 && b >= 16 && b <= 31)
  );
}

function isDevLocalHost(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);

  return (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    isPrivateIPv4(normalized)
  );
}

function isAllowedProtocolForEnv(url: URL): boolean {
  const protocol = normalizeProtocol(url.protocol);

  if (protocol === "https:") return true;

  if (__DEV__ && protocol === "http:" && isDevLocalHost(url.hostname)) {
    return true;
  }

  return false;
}

function getQueryValuesMap(url: URL): Map<string, string[]> {
  const map = new Map<string, string[]>();

  for (const [key, value] of url.searchParams.entries()) {
    const existing = map.get(key);

    if (existing) existing.push(value);
    else map.set(key, [value]);
  }

  for (const values of map.values()) {
    values.sort();
  }

  return map;
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

function hasSameOrigin(launch: URL, redirect: URL): boolean {
  return (
    isAllowedProtocolForEnv(launch) &&
    isAllowedProtocolForEnv(redirect) &&
    !launch.username &&
    !launch.password &&
    !redirect.username &&
    !redirect.password &&
    !launch.hash &&
    !redirect.hash &&
    normalizeHostname(launch.hostname) ===
      normalizeHostname(redirect.hostname) &&
    normalizePort(launch) === normalizePort(redirect)
  );
}

function hasAllowedQueryParams(launch: URL, redirect: URL): boolean {
  const launchParams = getQueryValuesMap(launch);
  const redirectParams = getQueryValuesMap(redirect);

  for (const [key, redirectValues] of redirectParams.entries()) {
    const launchValues = launchParams.get(key);

    if (!launchValues || !arraysEqual(launchValues, redirectValues)) {
      return false;
    }
  }

  for (const [key] of launchParams.entries()) {
    if (
      !redirectParams.has(key) &&
      !ALLOWED_RUNTIME_LAUNCH_QUERY_PARAMS.has(key)
    ) {
      return false;
    }
  }

  return true;
}

function isAllowedLaunchUrl(launchUrl: string, service?: ServiceItem): boolean {
  if (!launchUrl || !service?.redirectUri) return false;

  const launch = parseUrl(launchUrl);
  const redirect = parseUrl(service.redirectUri);

  if (!launch || !redirect) return false;

  if (!hasSameOrigin(launch, redirect)) return false;

  if (!hasAllowedQueryParams(launch, redirect)) return false;

  return true;
}

function redactUrlForLog(value?: string): string | null {
  if (!value) return null;

  const parsed = parseUrl(value);
  if (!parsed) return null;

  return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
}

export function useServiceAccessAction(): UseServiceAccessActionResult {
  const upsertPass = useAccessPassStore((s) => s.upsertPass);

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingStage, setPendingStage] = useState<PendingStage | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPending = useCallback(() => {
    setPendingId(null);
    setPendingStage(null);
  }, []);

  const clearResultMessage = useCallback(() => {
    setResultMessage(null);
  }, []);

  const safelyOpenLaunchUrl = useCallback(
    async (launchUrl: string, service?: ServiceItem): Promise<boolean> => {
      if (!isAllowedLaunchUrl(launchUrl, service)) {
        console.warn("BLOCKED_UNTRUSTED_LAUNCH_URL", {
          serviceId: service?.id,
          launchUrlBase: redactUrlForLog(launchUrl),
          redirectUriBase: redactUrlForLog(service?.redirectUri),
        });
        setResultMessage("Unsafe launch URL was blocked");
        return false;
      }

      try {
        await Linking.openURL(launchUrl);
        return true;
      } catch (error) {
        console.error("OPEN_LAUNCH_URL_FAILED", error);
        setResultMessage("Could not open service");
        return false;
      }
    },
    [],
  );

  const openOrSignIn = useCallback(
    async (service?: ServiceItem) => {
      if (pendingId) return;

      if (!service) {
        setResultMessage("Service information is missing");
        return;
      }

      try {
        setPendingId(service.id);
        setPendingStage(PendingStage.Starting);
        setResultMessage(null);

        const publicKey = await deviceKey.getPublicKey();
        if (!publicKey) {
          setResultMessage("DeviceKeyPair failed");
          clearPending();
          return;
        }

        const appInstanceId = await deviceKey.getOrCreateAppInstanceId();

        const started = await api.authMobile.start({
          clientId: service.clientId,
          redirectUri: service.redirectUri,
          publicKey,
          appInstanceId,
          uiLocales: Locale.EN,
        });

        if (
          !started?.challenge ||
          !started?.auth_request_id ||
          !started?.finish_token
        ) {
          setResultMessage("Verification failed");
          clearPending();
          return;
        }

        setPendingStage(PendingStage.Preparing);

        const challengeSignature = await deviceKey.signPairWithAuth(
          started.challenge,
        );

        const isConfirmed = Boolean(challengeSignature);
        const approved = isConfirmed ? Approved.YES : Approved.NO;

        const confirm = await api.authMobile.confirm({
          authRequestId: started.auth_request_id,
          publicKey,
          challengeSignature,
          approved,
          finishToken: started.finish_token,
          appInstanceId,
        });

        if (!isConfirmed) {
          clearPending();
          return;
        }

        if (!confirm?.accessGranted || !confirm?.deviceAccessPass) {
          setResultMessage("Verification failed");
          clearPending();
          return;
        }

        if (!confirm.launch_url) {
          setResultMessage("Service launch URL is missing");
          clearPending();
          return;
        }

        setPendingStage(PendingStage.Opening);

        upsertPass(mapPass(confirm.deviceAccessPass));

        const opened = await safelyOpenLaunchUrl(confirm.launch_url, service);

        if (!opened) {
          clearPending();
          return;
        }

        if (resetTimerRef.current) {
          clearTimeout(resetTimerRef.current);
        }

        resetTimerRef.current = setTimeout(() => {
          clearPending();
        }, 2000);
      } catch (error) {
        console.error("MOBILE_SIGN_IN_FAILED", error);
        clearPending();
        setResultMessage("Verification failed");
      }
    },
    [clearPending, pendingId, safelyOpenLaunchUrl, upsertPass],
  );

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  return {
    pendingId,
    pendingStage,
    resultMessage,
    clearResultMessage,
    openOrSignIn,
  };
}
