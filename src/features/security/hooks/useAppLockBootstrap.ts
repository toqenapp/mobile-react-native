import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";

import { LockedType, useSecurityStore } from "@/src/store/securityStore";
import { canUseLocalAuth } from "../lib/localAuth";
import { useUnlock } from "./useUnlock";

export const BIOMETRIC_MODAL_SHOWN_KEY = "@toqen.biometric_modal_shown_v1";

export function useAppLockBootstrap() {
  const appStateRef = useRef(AppState.currentState);
  const pendingBiometricModalRef = useRef(false);

  const setLockedType = useSecurityStore((s) => s.setLockedType);
  const setLastUnlockAt = useSecurityStore((s) => s.setLastUnlockAt);
  const settings = useSecurityStore((s) => s.settings);
  const pendingBiometricModal = useSecurityStore(
    (s) => s.pendingBiometricModal,
  );
  const setPendingBiometricModal = useSecurityStore(
    (s) => s.setPendingBiometricModal,
  );

  const { unlock, showAuthLocal } = useUnlock();

  pendingBiometricModalRef.current = pendingBiometricModal;

  useEffect(() => {
    (async () => {
      if (!settings.lockOnLaunch) {
        setLockedType();
        setLastUnlockAt(Date.now());
        return;
      }

      const modalShown = await AsyncStorage.getItem(BIOMETRIC_MODAL_SHOWN_KEY);

      if (!modalShown) {
        setLockedType(LockedType.Logo);
        setPendingBiometricModal(true);
        return;
      }

      const canUse = await canUseLocalAuth();

      if (canUse) {
        setLockedType(LockedType.Logo);
        void unlock("Unlock Toqen.app");
      } else {
        setLockedType(LockedType.BiometricDenied);
        setLastUnlockAt(null);
      }
    })();
  }, [
    settings.lockOnLaunch,
    unlock,
    setLastUnlockAt,
    setLockedType,
    setPendingBiometricModal,
  ]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", async (nextState) => {
      const prevState = appStateRef.current;
      appStateRef.current = nextState;

      if (showAuthLocal) return;
      if (pendingBiometricModalRef.current) return;

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
            setLockedType(LockedType.BiometricDenied);
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
