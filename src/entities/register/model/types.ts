export type RegisterInitRequest = void;

export enum REGISTER_PURPOSE {
  Init = "device_register_init",
  Complete = "device_register_complete",
}

export type RegisterCompleteRequest = {
  registrationId: string;
  signature: string;
  publicKey: string;
  appInstanceId: string;
};

export type RegisterInitResponse = {
  purpose: REGISTER_PURPOSE.Init;
  registration_id: string;
  challenge: string;
  server_now_ms: number;
  expires_at_ms: number;
};

export type RegisterCompleteResponse = {
  purpose: REGISTER_PURPOSE.Complete;
  registration_id: string;
  device_id: string;
  device_public_key: string;
  registered_at_ms: number;
};
