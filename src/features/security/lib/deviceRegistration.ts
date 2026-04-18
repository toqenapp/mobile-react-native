import { api } from "@/src/api";
import { deviceKey } from "@/src/providers/device-key";
import * as SecureStore from "expo-secure-store";

import {
  DEVICE_ID_KEY,
  DEVICE_REGISTERED_AT_MS_KEY,
  DEVICE_REGISTERED_KEY,
} from "./deviceKey/constants";

type RegistrationState = {
  isRegistered: string | null;
  deviceId: string | null;
  publicKey: string | null;
  appInstanceId: string | null;
};

async function getRegistrationState(): Promise<RegistrationState> {
  const [isRegistered, deviceId, publicKey, appInstanceId] = await Promise.all([
    SecureStore.getItemAsync(DEVICE_REGISTERED_KEY),
    SecureStore.getItemAsync(DEVICE_ID_KEY),
    deviceKey.getPublicKey(),
    deviceKey.getAppInstanceId(),
  ]);

  return {
    isRegistered,
    deviceId,
    publicKey,
    appInstanceId,
  };
}

function isFullyRegistered(state: RegistrationState): boolean {
  return (
    state.isRegistered === "1" &&
    Boolean(state.deviceId) &&
    Boolean(state.publicKey) &&
    Boolean(state.appInstanceId)
  );
}

function hasPartialRegistrationState(state: RegistrationState): boolean {
  const hasAnyLocalIdentity =
    Boolean(state.publicKey) ||
    Boolean(state.appInstanceId) ||
    Boolean(state.deviceId) ||
    state.isRegistered === "1";

  return hasAnyLocalIdentity && !isFullyRegistered(state);
}

let ensurePromise: Promise<void> | null = null;

export async function deviceRegistration() {
  if (ensurePromise) return ensurePromise;

  ensurePromise = (async () => {
    await deviceKey.migrateDeviceKeyIfNeeded();
    await deviceKey.fixPair();

    const initialState = await getRegistrationState();

    if (hasPartialRegistrationState(initialState)) {
      console.warn("DEVICE_REGISTRATION_PARTIAL_STATE_RESET", {
        hasRegisteredFlag: initialState.isRegistered === "1",
        hasDeviceId: Boolean(initialState.deviceId),
        hasPublicKey: Boolean(initialState.publicKey),
        hasAppInstanceId: Boolean(initialState.appInstanceId),
      });

      await deviceKey.resetPair();
    }

    const stateAfterCleanup = await getRegistrationState();

    if (isFullyRegistered(stateAfterCleanup)) {
      return;
    }

    const initResult = await api.register.init();
    const registrationId = initResult.registration_id;

    const publicKey = await deviceKey.createPair();
    const signature = await deviceKey.signPairWithAuth(initResult.challenge);
    const appInstanceId = await deviceKey.getOrCreateAppInstanceId();

    let completeResult: Awaited<ReturnType<typeof api.register.complete>>;

    try {
      completeResult = await api.register.complete({
        registrationId,
        publicKey,
        signature,
        appInstanceId,
      });
    } catch (error) {
      console.error("DEVICE_REGISTRATION_COMPLETE_FAILED_RESET", error);
      await deviceKey.resetPair();
      throw error;
    }

    if (completeResult.registration_id !== registrationId) {
      await deviceKey.resetPair();
      throw new Error("DEVICE_REGISTRATION_ID_MISMATCH");
    }

    if (completeResult.device_public_key !== publicKey) {
      await deviceKey.resetPair();
      throw new Error("DEVICE_REGISTRATION_PUBLIC_KEY_MISMATCH");
    }

    try {
      await SecureStore.setItemAsync(DEVICE_ID_KEY, completeResult.device_id);
      await SecureStore.setItemAsync(
        DEVICE_REGISTERED_AT_MS_KEY,
        String(completeResult.registered_at_ms),
      );
      await SecureStore.setItemAsync(DEVICE_REGISTERED_KEY, "1");
    } catch (error) {
      console.error("DEVICE_REGISTRATION_LOCAL_SAVE_FAILED_RESET", error);
      await deviceKey.resetPair();
      throw error;
    }
  })();

  try {
    await ensurePromise;
  } finally {
    ensurePromise = null;
  }
}
