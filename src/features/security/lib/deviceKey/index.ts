import DeviceKey from "@/modules/device-key";
import { encode as b64encode } from "base-64";
import { randomUUID } from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";

import {
  DEVICE_ID_KEY,
  DEVICE_KEY_VERSION,
  DEVICE_KEY_VERSION_KEY,
  DEVICE_REGISTERED_AT_MS_KEY,
  DEVICE_REGISTERED_KEY,
  INSTANCE_KEY_NAME,
  LEGACY_SEED_KEY_NAME,
  PUBLIC_KEY_NAME,
} from "./constants";

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return b64encode(binary);
}

function toBase64Url(bytes: Uint8Array): string {
  return bytesToBase64(bytes)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function utf8ToBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

let alreadyChecked = false;

async function getAppInstanceId(): Promise<string | null> {
  return SecureStore.getItemAsync(INSTANCE_KEY_NAME);
}

async function getOrCreateAppInstanceId(): Promise<string> {
  const existing = await getAppInstanceId();
  if (existing) return existing;

  const id = randomUUID();
  await SecureStore.setItemAsync(INSTANCE_KEY_NAME, id);
  return id;
}

async function getPublicKey(): Promise<string | null> {
  return SecureStore.getItemAsync(PUBLIC_KEY_NAME);
}

async function resetDeviceIdentity(): Promise<void> {
  try {
    await DeviceKey.deleteKeyPair();
  } catch (error) {
    console.error("DEVICE_KEY_DELETE_FAILED", error);
  }

  await Promise.allSettled([
    SecureStore.deleteItemAsync(PUBLIC_KEY_NAME),
    SecureStore.deleteItemAsync(LEGACY_SEED_KEY_NAME),
    SecureStore.deleteItemAsync(DEVICE_REGISTERED_KEY),
    SecureStore.deleteItemAsync(DEVICE_ID_KEY),
    SecureStore.deleteItemAsync(DEVICE_REGISTERED_AT_MS_KEY),
    SecureStore.deleteItemAsync(INSTANCE_KEY_NAME),
  ]);

  alreadyChecked = false;
}

async function createPair(): Promise<string> {
  try {
    const publicKeyBytes = await DeviceKey.generateKeyPair();
    const publicKey = toBase64Url(new Uint8Array(publicKeyBytes));

    await SecureStore.setItemAsync(PUBLIC_KEY_NAME, publicKey);
    await SecureStore.deleteItemAsync(LEGACY_SEED_KEY_NAME);

    return publicKey;
  } catch (error) {
    console.error("CREATE_PAIR_FAILED_RESET", error);

    await resetDeviceIdentity();

    const publicKeyBytes = await DeviceKey.generateKeyPair();
    const publicKey = toBase64Url(new Uint8Array(publicKeyBytes));

    await SecureStore.setItemAsync(PUBLIC_KEY_NAME, publicKey);

    return publicKey;
  }
}

async function signPairWithAuth(challenge: string): Promise<string> {
  if (!challenge) {
    throw new Error("Challenge is required");
  }

  const messageBytes = utf8ToBytes(challenge);
  const signatureBytes = await DeviceKey.signWithAuth(Array.from(messageBytes));

  return toBase64Url(new Uint8Array(signatureBytes));
}

async function resetPair(): Promise<void> {
  await resetDeviceIdentity();
}

async function fixPair(): Promise<void> {
  if (alreadyChecked) return;
  alreadyChecked = true;

  try {
    await createPair();
  } catch (error) {
    console.error("DEVICE_KEY_GENERATE_FAILED", error);

    await resetDeviceIdentity();

    Alert.alert(
      "Security update",
      "We updated device security. This device will be re-initialized.",
    );

    await createPair();
  }
}

async function migrateDeviceKeyIfNeeded(): Promise<void> {
  const current = await SecureStore.getItemAsync(DEVICE_KEY_VERSION_KEY);

  if (current === DEVICE_KEY_VERSION) return;

  console.warn("DEVICE_KEY_MIGRATION_RESET", {
    from: current,
    to: DEVICE_KEY_VERSION,
  });

  await resetDeviceIdentity();

  await SecureStore.setItemAsync(DEVICE_KEY_VERSION_KEY, DEVICE_KEY_VERSION);
}

const deviceKey = {
  getPublicKey,
  createPair,
  resetPair,
  signPairWithAuth,
  fixPair,
  getOrCreateAppInstanceId,
  getAppInstanceId,
  migrateDeviceKeyIfNeeded,
};

export { deviceKey };
