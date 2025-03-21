import { Linking, Platform, Share, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Button, Text } from "react-native-paper";
import { get, post } from "../../utils/apiService";
import { Constant } from "../../utils/constants";
import useStore from "../../utils/useStore";
import { router } from "expo-router";

const userProfile = () => {
  const [data, setData] = useState<any>(null);
  const { clearStore } = useStore();

  const logout = async () => {
    await post("auth/logout");
    clearStore();
    router.replace("/");
  };

  const getUser = async () => {
    const response: any = await get("user");
    setData(response.data);
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          margin: 20,
          flex: 1,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View></View>
        <View>
          <View
            style={{
              paddingTop: 10,
              paddingBottom: 10,
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            {data && (
              <View>
                <Text style={{ fontSize: 20 }}>
                  Name:{" "}
                  <Text style={{ color: "darkblue", fontWeight: "bold" }}>
                    {data.name}
                  </Text>
                </Text>
                <Text style={{ fontSize: 20 }}>
                  Phone Number:{" "}
                  <Text style={{ color: "darkblue", fontWeight: "bold" }}>
                    {data.phoneNumber}
                  </Text>
                </Text>
                <Text style={{ fontSize: 20 }}>
                  Email:{" "}
                  <Text style={{ color: "darkblue", fontWeight: "bold" }}>
                    {data.email}
                  </Text>
                </Text>
              </View>
            )}
          </View>
          <Button
            mode="outlined"
            onPress={() => {
              logout();
            }}
            style={{ alignSelf: "center" }}
          >
            Logout
          </Button>
        </View>
        <View>
          <Button
            icon="thumb-up"
            mode="elevated"
            textColor="darkgreen"
            onPress={() => {
              if (Platform.OS === "ios") {
                Linking.openURL(
                  "https://apps.apple.com/in/app/rate-india/id6504734648"
                );
              } else {
                Linking.openURL(
                  "https://play.google.com/store/apps/details?id=com.androjlk.callee"
                );
              }
            }}
            style={{ alignSelf: "center" }}
          >
            Rate Us
          </Button>
          <Button
            icon="share-variant"
            mode="elevated"
            textColor="darkgreen"
            onPress={shareApp}
            style={{ alignSelf: "center", marginTop: 20 }}
          >
            Share Callee
          </Button>
        </View>
        <View>
          <Text
            style={{
              color: "darkorange",
              alignSelf: "center",
              fontWeight: "bold",
              fontSize: 20,
              marginBottom: 20,
            }}
            onPress={() => Linking.openURL("https://callee.app/")}
          >
            callee.app
          </Text>
          <Text
            style={{
              color: "blue",
              textDecorationLine: "underline",
              alignSelf: "center",
              fontWeight: "bold",
              fontSize: 20,
            }}
            onPress={() => Linking.openURL("mailto:support@callee.app")}
          >
            support@callee.app
          </Text>
          <Text
            style={{
              marginTop: 5,
              color: "blue",
              alignSelf: "center",
              fontWeight: "bold",
              fontSize: 20,
            }}
            onPress={() => Linking.openURL("tel:+917356245819")}
          >
            +91-7356245819
          </Text>

          <Text
            style={{
              color: "gray",
              marginTop: 20,
              alignSelf: "center",
            }}
          >
            <Text
              style={{
                color: "blue",
                textDecorationLine: "underline",
                alignSelf: "center",
              }}
              onPress={() =>
                Linking.openURL("https://www.callee.app/terms-conditions")
              }
            >
              Terms & Conditions
            </Text>{" "}
            •{" "}
            <Text
              style={{
                color: "blue",
                textDecorationLine: "underline",
                alignSelf: "center",
              }}
              onPress={() =>
                Linking.openURL("https://www.callee.app/privacy-policy")
              }
            >
              Privacy Policy
            </Text>
          </Text>
          <Text
            style={{
              color: "gray",
              alignSelf: "center",
              fontSize: 10,
            }}
          >
            version: {Constant.APP_VERSION}
          </Text>
        </View>
      </View>
    </View>
  );
};

const shareApp = async () => {
  try {
    const result = await Share.share({
      message: `Callee - Payable Form Simplified

Callee is a simple and innovative platform that lets you create payable forms to collect money effortlessly

📱 Android - https://play.google.com/store/apps/details?id=com.androjlk.callee`,
    });

    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        console.log("Shared with activity type:", result.activityType);
      } else {
        console.log("Shared successfully");
      }
    } else if (result.action === Share.dismissedAction) {
      console.log("Share dismissed");
    }
  } catch (error: any) {
    alert(error.message);
  }
};

export default userProfile;
