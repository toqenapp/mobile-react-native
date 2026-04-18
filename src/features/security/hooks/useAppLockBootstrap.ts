import { useEffect, useRef } from "react";
import { AppState } from "react-native";

import { LockedType, useSecurityStore } from "@/src/store/securityStore";
import { canUseLocalAuth } from "../lib/localAuth";
import { useUnlock } from "./useUnlock";

export function useAppLockBootstrap() {
  const appStateRef = useRef(AppState.currentState);

  const setLockedType = useSecurityStore((s) => s.setLockedType);
  const setLastUnlockAt = useSecurityStore((s) => s.setLastUnlockAt);
  const settings = useSecurityStore((s) => s.settings);

  const { unlock, showAuthLocal } = useUnlock();

  useEffect(() => {
    (async () => {
      const canUse = await canUseLocalAuth();

      if (settings.lockOnLaunch) {
        if (canUse) {
          setLockedType(LockedType.Logo);
          void unlock("Unlock Toqen.app");
        } else {
          setLockedType(LockedType.Logo);
          setLastUnlockAt(null);
        }
      } else {
        setLockedType();
        setLastUnlockAt(Date.now());
      }
    })();
  }, [settings.lockOnLaunch, unlock, setLastUnlockAt, setLockedType]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", async (nextState) => {
      const prevState = appStateRef.current;
      appStateRef.current = nextState;

      if (showAuthLocal) return;

      if (nextState === "background") {
        setLockedType(LockedType.Logo);
        return;
      }

      if (prevState === "background" && nextState === "active") {
        const canUse = await canUseLocalAuth();

        if (settings.lockOnResume) {
          if (canUse) {
            setLockedType(LockedType.Logo);
            void unlock("Unlock Toqen.app");
          } else {
            setLockedType(LockedType.Logo);
            setLastUnlockAt(null);
          }
        } else {
          setLockedType();
          setLastUnlockAt(Date.now());
        }
      }
    });

    return () => {
      sub.remove();
    };
  }, [
    settings.lockOnResume,
    showAuthLocal,
    unlock,
    setLastUnlockAt,
    setLockedType,
  ]);
}
