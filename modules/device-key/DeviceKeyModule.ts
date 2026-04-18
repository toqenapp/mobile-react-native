import { requireNativeModule } from "expo";

export type DeviceKeyModuleType = {
  generateKeyPair(): Promise<number[]>;
  signWithAuth(message: number[] | Uint8Array): Promise<number[]>;
  deleteKeyPair(): Promise<void>;
};

const DeviceKey = requireNativeModule<DeviceKeyModuleType>("DeviceKey");

export default DeviceKey;
