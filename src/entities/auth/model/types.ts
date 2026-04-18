import { DeviceAccessPass } from "../../device-access-pass/model/types";

export type AuthSession = {
  requestId: string;
  clientId: string;
  projectId: string;
  nonce: string;
  expiresAtMs: number;
  service: string;
  challenge?: string;
  location?: string;
};

export type AuthScannedPayload = {
  requestId: string;
  nonce: string;
  publicKey: string;
  appInstanceId: string;
};

export type AuthScannedResponse = {
  requestId: string;
  clientId: string;
  projectId: string;
  challenge: string;
  service: string;
  location: string;
  expires: number;
};

export type AuthManualCodePayload = {
  manualCode: string;
  publicKey: string;
  appInstanceId: string;
};

export type AuthManualCodeResponse = {
  requestId: string;
  clientId: string;
  projectId: string;
  challenge: string;
  service: string;
  location: string;
  expires: number;
  nonce: string;
};

export type ConfirmPayload = {
  approved: string;
  requestId: string;
  challengeSignature: string;
  nonce: string;
  publicKey: string;
  appInstanceId: string;
};

export type ConfirmResponse = {
  accessGranted: boolean;
  deviceAccessPass?: DeviceAccessPass | null;
};
