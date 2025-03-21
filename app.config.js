const getUniqueIdentifier = () => {
  switch (process.env.APP_VARIANT) {
    case "development":
      return "com.androjlk.callee.dev";
    case "preview":
      return "com.androjlk.callee.preview";
    default:
      return "com.androjlk.callee";
  }
};

const getAppName = () => {
  switch (process.env.APP_VARIANT) {
    case "development":
      return "Callee_Dev";
    case "preview":
      return "Callee_Preview";
    default:
      return "Callee";
  }
};

export default {
  expo: {
    name: getAppName(),
    scheme: "callee",
    slug: "callee-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: getUniqueIdentifier(),
      config: {
        usesNonExemptEncryption: false,
      },
      buildNumber: "1",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: getUniqueIdentifier(),
      googleServicesFile: "./google-services.json",
    },
    web: {
      // favicon: "./assets/favicon.png",
    },
    plugins: ["expo-router", "expo-secure-store"],
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "63739df8-d667-41b0-8d51-e7f159530897",
      },
    },
  },
};
