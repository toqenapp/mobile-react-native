export function normalizeExpiresAtMs(expiresAt?: number | null): number | null {
  if (!expiresAt) return null;

  if (expiresAt < 10_000_000_000) {
    return expiresAt * 1000;
  }

  return expiresAt;
}

export function isExpired(expiresAtMs?: number | null): boolean {
  if (!expiresAtMs) return false;
  return Date.now() > expiresAtMs;
}

export function getRemainingMs(expiresAtMs?: number | null): number | null {
  if (!expiresAtMs) return null;
  return Math.max(0, expiresAtMs - Date.now());
}
