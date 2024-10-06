// import { View } from "react-native";
// import React from "react";
// import { ActivityIndicator, Modal, Text } from "react-native-paper";

// const index = () => {
//   return (
//     <View style={{ justifyContent: "center", flex: 1 }}>
//       <Modal dismissable={false} visible={true}>
//         <Text>laksdjflaksjflaksjdflkasjflkasjdflk</Text>
//         <ActivityIndicator animating={true} size="large" />
//       </Modal>
//     </View>
//   );
// };

// export default index;

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  DefaultTheme,
  Modal,
  PaperProvider,
} from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import useStore from "../utils/useStore";
import { getSecureStoreData } from "../utils/secureStore";
import { router, Stack } from "expo-router";

const index = () => {
  const { setToken } = useStore();

  const init = async () => {
    const token = await getSecureStoreData("token");
    setToken(token || "");

    if (token) {
      router.replace("/loggedIn"); // Ensure route matches your folder structure
    } else {
      router.replace("/login"); // Ensure route matches your folder structure
    }
  };

  useEffect(() => {
    init();
  }, []);

  return <></>;
};

export default index;
