import ExpoModulesCore
import LocalAuthentication
import Security

public final class DeviceKeyModule: Module {
  private let tag = "com.toqen.app.devicekey.p256"

  public func definition() -> ModuleDefinition {
    Name("DeviceKey")

    AsyncFunction("generateKeyPair") { () throws -> [UInt8] in
      if let existingKey = try self.copyPrivateKey() {
        let publicKey = try self.copyPublicKeyData(from: existingKey)
        return [UInt8](publicKey)
      }

      let privateKey = try self.createSecureEnclavePrivateKey()
      let publicKey = try self.copyPublicKeyData(from: privateKey)
      return [UInt8](publicKey)
    }

    AsyncFunction("signWithAuth") { (message: [UInt8]) throws -> [UInt8] in
      let context = LAContext()
      context.localizedReason = "Confirm sign in"
      context.interactionNotAllowed = false

      var authError: NSError?
      guard context.canEvaluatePolicy(
        .deviceOwnerAuthenticationWithBiometrics,
        error: &authError
      ) else {
        throw authError ?? NSError(
          domain: "DeviceKey",
          code: 401,
          userInfo: [
            NSLocalizedDescriptionKey: "Biometric authentication not available"
          ]
        )
      }

      guard let privateKey = try self.copyPrivateKey(
        authenticationContext: context
      ) else {
        throw NSError(
          domain: "DeviceKey",
          code: 404,
          userInfo: [
            NSLocalizedDescriptionKey: "Secure Enclave private key not found"
          ]
        )
      }

      let algorithm: SecKeyAlgorithm = .ecdsaSignatureMessageX962SHA256

      guard SecKeyIsAlgorithmSupported(privateKey, .sign, algorithm) else {
        throw NSError(
          domain: "DeviceKey",
          code: 500,
          userInfo: [
            NSLocalizedDescriptionKey: "Signing algorithm not supported"
          ]
        )
      }

      var error: Unmanaged<CFError>?

      guard let signature = SecKeyCreateSignature(
        privateKey,
        algorithm,
        Data(message) as CFData,
        &error
      ) as Data? else {
        let resolvedError = error?.takeRetainedValue()
        throw resolvedError ?? NSError(
          domain: "DeviceKey",
          code: 500,
          userInfo: [
            NSLocalizedDescriptionKey: "Failed to create signature"
          ]
        )
      }

      return [UInt8](signature)
    }

    AsyncFunction("deleteKeyPair") { () throws -> Void in
      let status = self.deleteSecureEnclavePrivateKey()

      guard status == errSecSuccess || status == errSecItemNotFound else {
        throw NSError(
          domain: "DeviceKey",
          code: Int(status),
          userInfo: [
            NSLocalizedDescriptionKey: "Failed to delete Secure Enclave key"
          ]
        )
      }
    }
  }

  private func createSecureEnclavePrivateKey() throws -> SecKey {
    let tagData = Data(tag.utf8)

    var accessError: Unmanaged<CFError>?
    guard let access = SecAccessControlCreateWithFlags(
      nil,
      kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
      [.privateKeyUsage, .biometryCurrentSet],
      &accessError
    ) else {
      let resolvedError = accessError?.takeRetainedValue()
      throw resolvedError ?? NSError(
        domain: "DeviceKey",
        code: 500,
        userInfo: [
          NSLocalizedDescriptionKey: "Failed to create access control"
        ]
      )
    }

    let attributes: [String: Any] = [
      kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
      kSecAttrKeySizeInBits as String: 256,
      kSecAttrTokenID as String: kSecAttrTokenIDSecureEnclave,
      kSecPrivateKeyAttrs as String: [
        kSecAttrIsPermanent as String: true,
        kSecAttrApplicationTag as String: tagData,
        kSecAttrAccessControl as String: access
      ]
    ]

    var error: Unmanaged<CFError>?

    guard let privateKey = SecKeyCreateRandomKey(
      attributes as CFDictionary,
      &error
    ) else {
      let resolvedError = error?.takeRetainedValue()
      throw resolvedError ?? NSError(
        domain: "DeviceKey",
        code: 500,
        userInfo: [
          NSLocalizedDescriptionKey: "Failed to generate Secure Enclave key"
        ]
      )
    }

    return privateKey
  }

  private func copyPrivateKey(
    authenticationContext: LAContext? = nil
  ) throws -> SecKey? {
    var query: [String: Any] = [
      kSecClass as String: kSecClassKey,
      kSecAttrApplicationTag as String: Data(tag.utf8),
      kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
      kSecAttrTokenID as String: kSecAttrTokenIDSecureEnclave,
      kSecReturnRef as String: true
    ]

    if let authenticationContext {
      query[kSecUseAuthenticationContext as String] = authenticationContext
    }

    var item: CFTypeRef?
    let status = SecItemCopyMatching(query as CFDictionary, &item)

    if status == errSecItemNotFound {
      return nil
    }

    guard status == errSecSuccess, let item else {
      throw NSError(
        domain: "DeviceKey",
        code: Int(status),
        userInfo: [
          NSLocalizedDescriptionKey: "Failed to fetch Secure Enclave key"
        ]
      )
    }

    guard CFGetTypeID(item) == SecKeyGetTypeID() else {
      throw NSError(
        domain: "DeviceKey",
        code: 500,
        userInfo: [
          NSLocalizedDescriptionKey: "Fetched item is not a SecKey"
        ]
      )
    }

    return unsafeBitCast(item, to: SecKey.self)
  }

  private func deleteSecureEnclavePrivateKey() -> OSStatus {
    let query: [String: Any] = [
      kSecClass as String: kSecClassKey,
      kSecAttrApplicationTag as String: Data(tag.utf8),
      kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
      kSecAttrTokenID as String: kSecAttrTokenIDSecureEnclave
    ]

    return SecItemDelete(query as CFDictionary)
  }

  private func copyPublicKeyData(from privateKey: SecKey) throws -> Data {
    guard let publicKey = SecKeyCopyPublicKey(privateKey) else {
      throw NSError(
        domain: "DeviceKey",
        code: 500,
        userInfo: [
          NSLocalizedDescriptionKey: "Failed to copy public key"
        ]
      )
    }

    var error: Unmanaged<CFError>?

    guard let publicKeyData = SecKeyCopyExternalRepresentation(
      publicKey,
      &error
    ) as Data? else {
      let resolvedError = error?.takeRetainedValue()
      throw resolvedError ?? NSError(
        domain: "DeviceKey",
        code: 500,
        userInfo: [
          NSLocalizedDescriptionKey: "Failed to export public key"
        ]
      )
    }

    return publicKeyData
  }
}
