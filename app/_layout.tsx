import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  DefaultTheme,
  Modal,
  PaperProvider,
  Portal,
  Snackbar,
} from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import useStore from "../utils/useStore";
import { getSecureStoreData } from "../utils/secureStore";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const _layout = () => {
  const { loading, snackbarText, setSnackbarText } = useStore();

  return (
    <PaperProvider theme={DefaultTheme}>
      <StatusBar style="auto" />
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
        {loading && (
          <Portal>
            <Modal dismissable={false} visible={true}>
              <ActivityIndicator animating={true} size="large" />
            </Modal>
          </Portal>
        )}
        {snackbarText.length > 0 && (
          <Portal>
            <Snackbar
              visible={snackbarText.length > 0}
              onDismiss={() => {
                setSnackbarText("");
              }}
              action={{
                label: "close",
                onPress: () => {
                  setSnackbarText("");
                },
              }}
            >
              {snackbarText}
            </Snackbar>
          </Portal>
        )}
      </SafeAreaProvider>
    </PaperProvider>
  );
};

export default _layout;
