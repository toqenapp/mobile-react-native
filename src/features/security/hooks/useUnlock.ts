import { authenticateLocal } from "@/src/features/security/lib/localAuth";
import { LockedType, useSecurityStore } from "@/src/store/securityStore";
import { useCallback, useState } from "react";

export function useUnlock() {
  const [showAuthLocal, setShowAuthLocal] = useState(false);

  const setLockedType = useSecurityStore((s) => s.setLockedType);
  const setLastUnlockAt = useSecurityStore((s) => s.setLastUnlockAt);

  const unlock = useCallback(
    async (promptMessage: string) => {
      setShowAuthLocal(true);

      try {
        const ok = await authenticateLocal({ promptMessage });

        if (ok) {
          setLockedType();
          setLastUnlockAt(Date.now());
        } else {
          setLockedType(LockedType.LogoAndUnlockBtn);
        }
      } catch {
        setLockedType(LockedType.LogoAndUnlockBtn);
      } finally {
        setShowAuthLocal(false);
      }
    },
    [setLastUnlockAt, setLockedType],
  );

  return { unlock, showAuthLocal };
}
