import React from "react";
import { Stack } from "expo-router";

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="userProfile" options={{ headerTitle: "Profile" }} />
    </Stack>
  );
};

export default _layout;
