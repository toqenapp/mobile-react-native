const pkg = require("./package.json");
const { buildMeta } = require("./src/build-meta");

module.exports = ({ config }) => {
  const projectId =
    process.env.EXPO_PROJECT_ID ||
    process.env.EAS_BUILD_PROJECT_ID ||
    undefined;

  if (!projectId) {
    throw new Error("Project ID is missing");
  }

  const workflowUrl =
    buildMeta?.workflowUrl ||
    "https://github.com/toqenapp/mobile-react-native/actions";
  const gitCommitHash = buildMeta?.gitCommitHash || "local";
  const gitTag = buildMeta?.gitTag || "dev";

  return {
    ...config,

    name: "Toqen.app",
    slug: "toqen-app",
    version: pkg.version,
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "toqenapp",
    userInterfaceStyle: "dark",
    backgroundColor: "#0B1020",

    ios: {
      bundleIdentifier: "app.toqen.mobile",
      supportsTablet: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSFaceIDUsageDescription:
          "Toqen.app uses Face ID to protect your cryptographic device key and confirm authentication requests. Your biometric data is never stored or transmitted.",
      },
    },

    android: {
      package: "mobile.toqen.app",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon-foreground.png",
        backgroundImage: "./assets/images/adaptive-icon-background.png",
        monochromeImage: "./assets/images/adaptive-icon-monochrome.png",
      },
      predictiveBackGestureEnabled: false,
      intentFilters: [
        {
          action: "VIEW",
          data: [{ scheme: "toqenapp", host: "*" }],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
      permissions: ["android.permission.CAMERA"],
      blockedPermissions: ["android.permission.RECORD_AUDIO"],
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          resizeMode: "contain",
          backgroundColor: "#000000",
        },
      ],
      [
        "expo-camera",
        {
          cameraPermission:
            "Allow Toqen.app to use the camera to scan QR codes",
        },
      ],
      [
        "expo-navigation-bar",
        {
          enforceContrast: false,
          barStyle: "light",
          visibility: "visible",
        },
      ],
      "expo-secure-store",
      "expo-sqlite",
      "expo-web-browser",
    ],

    experiments: {
      typedRoutes: true,
    },

    extra: {
      ...config.extra,
      router: {},
      eas: { projectId },

      gitCommitHash,
      gitTag,
      workflowUrl,
      baseUrl: "https://www.toqen.app",
    },
  };
};
