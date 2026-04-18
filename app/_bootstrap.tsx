import { useEffect } from "react";

import { useAppLockBootstrap } from "@/src/features/security/hooks/useAppLockBootstrap";
import { deviceRegistration } from "@/src/features/security/lib/deviceRegistration";
import { useServicesBootstrap } from "@/src/features/services/hooks/useServicesBootstrap";

export default function AppBootstrap() {
  useServicesBootstrap();
  useAppLockBootstrap();

  useEffect(() => {
    void (async () => {
      try {
        await deviceRegistration();
      } catch (error) {
        console.error("BOOTSTRAP_FAILED", error);
      }
    })();
  }, []);
  return null;
}
