import { Approved, Locale } from "../../common";
import { DeviceAccessPass } from "../../device-access-pass/model/types";

export enum LaunchMode {
  WEB = "web",
  APP = "app",
}

export type StartAuthMobilePayload = {
  clientId: string;
  redirectUri: string;
  publicKey: string;
  appInstanceId: string;
  uiLocales: Locale;
};

export type StartAuthMobileResponse = {
  auth_request_id: string;
  challenge: string;
  client_id: string;
  service_name?: string | null;
  finish_token: string;
};

export type ConfirmAuthMobilePayload = {
  authRequestId: string;
  publicKey: string;
  challengeSignature: string;
  approved: Approved;
  finishToken: string;
  appInstanceId: string;
};

export type ConfirmAuthMobileResponse = {
  launch_mode: LaunchMode;
  launch_url: string;
  accessGranted: boolean;
  deviceAccessPass?: DeviceAccessPass | null;
};
