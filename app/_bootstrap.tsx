import { useEffect, useRef } from "react";

import { useAppLockBootstrap } from "@/src/features/security/hooks/useAppLockBootstrap";
import { deviceRegistration } from "@/src/features/security/lib/deviceRegistration";
import { useServicesBootstrap } from "@/src/features/services/hooks/useServicesBootstrap";
import { useSecurityStore } from "@/src/store/securityStore";

export default function AppBootstrap() {
  useServicesBootstrap();
  useAppLockBootstrap();

  const lastUnlockAt = useSecurityStore((s) => s.lastUnlockAt);
  const registrationStartedRef = useRef(false);

  useEffect(() => {
    if (lastUnlockAt === null) return;
    if (registrationStartedRef.current) return;
    registrationStartedRef.current = true;

    void (async () => {
      try {
        await deviceRegistration();
      } catch (error) {
        console.error("BOOTSTRAP_FAILED", error);
      }
    })();
  }, [lastUnlockAt]);

  return null;
}
