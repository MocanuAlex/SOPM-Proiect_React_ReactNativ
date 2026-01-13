module.exports = {
  expo: {
    name: "To Do List",
    slug: "to-do-list",
    version: "0.1.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    splash: {
      resizeMode: "contain",
      backgroundColor: "#dbe2ea"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.todolist.app"
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#dbe2ea"
      },
      package: "com.todolist.app"
    },
    web: {
      bundler: "metro"
    }
  }
};

