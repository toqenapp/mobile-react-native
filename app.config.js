const pkg = require("./package.json");

function getRequiredEnv(name, fallback) {
  let raw;

  switch (name) {
    case "APP_GIT_COMMIT_HASH":
      raw = process.env.APP_GIT_COMMIT_HASH;
      break;
    case "APP_GIT_TAG":
      raw = process.env.APP_GIT_TAG;
      break;
    case "APP_WORKFLOW_URL":
      raw = process.env.APP_WORKFLOW_URL;
      break;
    case "APP_COMMIT_URL":
      raw = process.env.APP_COMMIT_URL;
      break;
    default:
      raw = undefined;
  }

  const value =
    typeof raw === "string" && raw.trim()
      ? raw.trim()
      : typeof fallback === "string" && fallback.trim()
        ? fallback.trim()
        : "";

  if (!value) {
    throw new Error(`${name} is missing`);
  }

  return value;
}

module.exports = ({ config }) => {
  const projectId =
    process.env.EXPO_PROJECT_ID ||
    process.env.EAS_BUILD_PROJECT_ID ||
    undefined;

  if (!projectId) {
    throw new Error("Project ID is missing");
  }

  const build =
    process.env.EAS_BUILD_ANDROID_VERSION_CODE ||
    process.env.EAS_BUILD_IOS_BUILD_NUMBER ||
    "0";

  const gitCommitHash = getRequiredEnv("APP_GIT_COMMIT_HASH", "local");
  const gitTag = getRequiredEnv("APP_GIT_TAG", "dev");
  const workflowUrl = getRequiredEnv("APP_WORKFLOW_URL", "https://github.com");
  const commitUrl = getRequiredEnv("APP_COMMIT_URL", "https://github.com");

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
    ],

    experiments: {
      typedRoutes: true,
    },

    extra: {
      ...config.extra,
      router: {},
      eas: { projectId },

      build,
      gitCommitHash,
      gitTag,
      workflowUrl,
      commitUrl,

      baseUrl: "https://www.toqen.app",
    },
  };
};
