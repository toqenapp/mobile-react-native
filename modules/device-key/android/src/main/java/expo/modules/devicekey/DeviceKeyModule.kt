package expo.modules.devicekey

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyInfo
import android.security.keystore.KeyProperties
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.math.BigInteger
import java.security.InvalidAlgorithmParameterException
import java.security.KeyFactory
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.PrivateKey
import java.security.Signature
import java.security.interfaces.ECPublicKey
import java.security.spec.ECGenParameterSpec

class DeviceKeyModule : Module() {
  private val alias = "com.toqen.app.devicekey.p256"
  private val provider = "AndroidKeyStore"
  private val signAlgorithm = "SHA256withECDSA"

  override fun definition() = ModuleDefinition {
    Name("DeviceKey")

    AsyncFunction("generateKeyPair") {
      val keyStore = loadKeyStore()
      val existingEntry = getPrivateKeyEntryOrNull(keyStore)

      if (existingEntry != null) {
        validatePrivateKey(existingEntry.privateKey)

        val publicKey = existingEntry.certificate.publicKey as? ECPublicKey
          ?: throw IllegalStateException("Stored public key is not an EC public key")

        return@AsyncFunction rawUncompressedPublicKey(publicKey).toIntList()
      }

      generateHardwareProtectedKeyPair()

      val createdEntry = getPrivateKeyEntryOrNull(loadKeyStore())
        ?: throw IllegalStateException("Private key was not found after generation")

      validatePrivateKey(createdEntry.privateKey)

      val publicKey = createdEntry.certificate.publicKey as? ECPublicKey
        ?: throw IllegalStateException("Generated public key is not an EC public key")

      rawUncompressedPublicKey(publicKey).toIntList()
    }

    AsyncFunction("signWithAuth") { message: List<Int>, promise: Promise ->
      val activity = requireFragmentActivity()
      if (activity == null) {
        promise.reject("NO_ACTIVITY", "FragmentActivity is not available", null)
        return@AsyncFunction
      }

      val biometricManager = BiometricManager.from(activity)
      val canAuthenticate = biometricManager.canAuthenticate(
        BiometricManager.Authenticators.BIOMETRIC_STRONG
      )

      if (canAuthenticate != BiometricManager.BIOMETRIC_SUCCESS) {
        promise.reject(
          "BIOMETRIC_UNAVAILABLE",
          biometricUnavailableMessage(canAuthenticate),
          null
        )
        return@AsyncFunction
      }

      val entry = getPrivateKeyEntryOrNull(loadKeyStore())
      if (entry == null) {
        promise.reject(
          "KEY_NOT_FOUND",
          "Hardware-backed private key not found",
          null
        )
        return@AsyncFunction
      }

      val messageBytes = message.map { (it and 0xFF).toByte() }.toByteArray()

      activity.runOnUiThread {
        try {
          validatePrivateKey(entry.privateKey)

          val signature = Signature.getInstance(signAlgorithm)
          signature.initSign(entry.privateKey)

          val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle("Confirm sign in")
            .setSubtitle("Use biometrics to continue")
            .setNegativeButtonText("Cancel")
            .build()

          var settled = false

          val biometricPrompt = BiometricPrompt(
            activity,
            ContextCompat.getMainExecutor(activity),
            object : BiometricPrompt.AuthenticationCallback() {
              override fun onAuthenticationSucceeded(
                result: BiometricPrompt.AuthenticationResult
              ) {
                if (settled) return
                settled = true

                try {
                  Thread.sleep(50)

                  signature.update(messageBytes)
                  val signed = signature.sign()

                  promise.resolve(signed.toIntList())
                } catch (e: Exception) {
                  promise.reject(
                    "SIGN_FAILED",
                    e.message ?: "Failed to sign challenge",
                    e
                  )
                }
              }

              override fun onAuthenticationError(
                errorCode: Int,
                errString: CharSequence
              ) {
                if (settled) return
                settled = true

                promise.reject(
                  "AUTH_ERROR",
                  "[$errorCode] $errString",
                  null
                )
              }
            }
          )

          biometricPrompt.authenticate(
            promptInfo,
            BiometricPrompt.CryptoObject(signature)
          )
        } catch (e: Exception) {
          promise.reject(
            "INIT_FAILED",
            e.message ?: "Failed to initialize signing",
            e
          )
        }
      }
    }

    AsyncFunction("deleteKeyPair") {
      val keyStore = loadKeyStore()
      if (keyStore.containsAlias(alias)) {
        keyStore.deleteEntry(alias)
      }
    }
  }

  private fun requireFragmentActivity(): FragmentActivity? {
    return appContext.currentActivity as? FragmentActivity
  }

  private fun requireContext(): Context? {
    return appContext.reactContext ?: appContext.currentActivity
  }

  private fun loadKeyStore(): KeyStore {
    return KeyStore.getInstance(provider).apply {
      load(null)
    }
  }

  private fun getPrivateKeyEntryOrNull(keyStore: KeyStore): KeyStore.PrivateKeyEntry? {
    if (!keyStore.containsAlias(alias)) return null

    val entry = keyStore.getEntry(alias, null) ?: return null

    return entry as? KeyStore.PrivateKeyEntry
      ?: throw IllegalStateException("Stored entry is not a PrivateKeyEntry")
  }

  private fun generateHardwareProtectedKeyPair() {
    val supportsStrongBox = supportsStrongBox()

    if (supportsStrongBox) {
      try {
        generateKeyPair(useStrongBox = true)
        return
      } catch (e: InvalidAlgorithmParameterException) {
        // StrongBox unavailable on this device; fall back to TEE
      }
    }

    generateKeyPair(useStrongBox = false)
  }

  private fun generateKeyPair(useStrongBox: Boolean) {
    val keyPairGenerator = KeyPairGenerator.getInstance(
      KeyProperties.KEY_ALGORITHM_EC,
      provider
    )

    val specBuilder = KeyGenParameterSpec.Builder(
      alias,
      KeyProperties.PURPOSE_SIGN
    )
      .setAlgorithmParameterSpec(ECGenParameterSpec("secp256r1"))
      .setDigests(KeyProperties.DIGEST_SHA256)
      .setUserAuthenticationRequired(true)
      .setInvalidatedByBiometricEnrollment(true)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P && useStrongBox) {
      specBuilder.setIsStrongBoxBacked(true)
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      specBuilder.setUserAuthenticationParameters(
        0,
        KeyProperties.AUTH_BIOMETRIC_STRONG
      )
    } else {
      @Suppress("DEPRECATION")
      specBuilder.setUserAuthenticationValidityDurationSeconds(0)
    }

    keyPairGenerator.initialize(specBuilder.build())
    keyPairGenerator.generateKeyPair()
  }

  private fun supportsStrongBox(): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) return false

    val context = requireContext() ?: return false
    return context.packageManager.hasSystemFeature(PackageManager.FEATURE_STRONGBOX_KEYSTORE)
  }

  private fun validatePrivateKey(privateKey: PrivateKey) {
    val keyInfo = getKeyInfo(privateKey)

    ensurePurposeSign(keyInfo)
    ensureAuthenticationRequired(keyInfo)
  }

  private fun getKeyInfo(privateKey: PrivateKey): KeyInfo {
    val keyFactory = KeyFactory.getInstance(privateKey.algorithm, provider)
    return keyFactory.getKeySpec(privateKey, KeyInfo::class.java)
  }

  private fun ensurePurposeSign(keyInfo: KeyInfo) {
    if (keyInfo.purposes and KeyProperties.PURPOSE_SIGN == 0) {
      throw IllegalStateException("Key does not allow signing")
    }
  }

  private fun ensureAuthenticationRequired(keyInfo: KeyInfo) {
    if (!keyInfo.isUserAuthenticationRequired) {
      throw IllegalStateException("Key must require user authentication")
    }
  }

  private fun biometricUnavailableMessage(code: Int): String {
    return when (code) {
      BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE ->
        "This device does not have biometric hardware"
      BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE ->
        "Biometric hardware is currently unavailable"
      BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED ->
        "No strong biometric credential is enrolled on this device"
      BiometricManager.BIOMETRIC_ERROR_SECURITY_UPDATE_REQUIRED ->
        "A security update is required before biometric authentication can be used"
      BiometricManager.BIOMETRIC_ERROR_UNSUPPORTED ->
        "Strong biometric authentication is not supported on this device"
      BiometricManager.BIOMETRIC_STATUS_UNKNOWN ->
        "Biometric status is unknown"
      else ->
        "Strong biometric authentication is not available"
    }
  }

  private fun rawUncompressedPublicKey(publicKey: ECPublicKey): ByteArray {
    val point = publicKey.w
    val x = toFixedLength(point.affineX, 32)
    val y = toFixedLength(point.affineY, 32)

    return byteArrayOf(0x04) + x + y
  }

  private fun toFixedLength(value: BigInteger, size: Int): ByteArray {
    val bytes = value.toByteArray()

    return when {
      bytes.size == size -> bytes
      bytes.size < size -> ByteArray(size - bytes.size) + bytes
      bytes.size == size + 1 && bytes[0] == 0.toByte() -> bytes.copyOfRange(1, bytes.size)
      else -> throw IllegalStateException("Unexpected coordinate length: ${bytes.size}")
    }
  }

  private fun ByteArray.toIntList(): List<Int> {
    return map { it.toInt() and 0xFF }
  }
}
