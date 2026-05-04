import { api } from "@/src/api";
import { deviceKey } from "@/src/providers/device-key";
import * as SecureStore from "expo-secure-store";

import { sleep } from "@/src/shared/lib/sleep";
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

export let registrationBiometricActive = false;

export async function deviceRegistration(): Promise<void> {
  if (ensurePromise) {
    return ensurePromise;
  }

  ensurePromise = (async () => {
    await deviceKey.migrateDeviceKeyIfNeeded();

    const initialState = await getRegistrationState();

    if (isFullyRegistered(initialState)) {
      return;
    }

    if (hasPartialRegistrationState(initialState)) {
      await deviceKey.resetPair();
      await sleep(10);
    }

    const stateAfterCleanup = await getRegistrationState();

    if (isFullyRegistered(stateAfterCleanup)) {
      return;
    }

    await deviceKey.fixPair();
    await sleep(10);

    const stateAfterFixPair = await getRegistrationState();

    if (isFullyRegistered(stateAfterFixPair)) {
      return;
    }

    const initResult = await api.register.init();
    const registrationId = initResult.registration_id;

    const publicKey = await deviceKey.createPair();
    await sleep(10);

    registrationBiometricActive = true;
    const signature = await deviceKey
      .signPairWithAuth(initResult.challenge)
      .finally(() => {
        registrationBiometricActive = false;
      });
    await sleep(10);

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
      await deviceKey.resetPair();
      await sleep(10);
      throw error;
    }

    if (completeResult.registration_id !== registrationId) {
      await deviceKey.resetPair();
      await sleep(10);
      throw new Error("DEVICE_REGISTRATION_ID_MISMATCH");
    }

    if (completeResult.device_public_key !== publicKey) {
      await deviceKey.resetPair();
      await sleep(10);
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
      await deviceKey.resetPair();
      await sleep(10);
      throw error;
    }

    const finalState = await getRegistrationState();

    if (!isFullyRegistered(finalState)) {
      throw new Error("DEVICE_REGISTRATION_FINAL_STATE_INVALID");
    }
  })();

  try {
    await ensurePromise;
  } finally {
    ensurePromise = null;
  }
}
