# Mobile Data Handling

This mobile repository documents mobile-local storage and cache behavior.

## Mobile Data Categories

| Data                    | Storage                                   | Purpose                   | Authorization authority        |
| ----------------------- | ----------------------------------------- | ------------------------- | ------------------------------ |
| Device public key       | SecureStore / native module exposed value | Device registration       | No                             |
| Device identity markers | SecureStore                               | Local identity continuity | No                             |
| Service cache           | AsyncStorage                              | Presentation              | No                             |
| Access-pass cache       | AsyncStorage                              | Presentation              | No                             |
| Private key material    | Native platform key storage               | Approval signing          | No, server verifies signatures |
| Biometric data          | Operating system only                     | Local authentication      | No                             |

See [Mobile secure storage](./storage.md).
