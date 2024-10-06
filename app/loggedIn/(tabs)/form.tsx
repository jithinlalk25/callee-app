import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  Share,
  View,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Card, Divider, IconButton, Text } from "react-native-paper";
import { router, useFocusEffect, useNavigation } from "expo-router";
import { get, post } from "../../../utils/apiService";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const deleteForm = async (formId: string) => {
  const response: any = await post("form/deleteForm", { formId });
};

const sharePaymentLink = async (title: string, link: string) => {
  try {
    const result = await Share.share({
      message: `${title}\nMake your payment at Callee: ${link}`,
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

const form = () => {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    []
  );
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => token && setExpoPushToken(token)
    );

    if (Platform.OS === "android") {
      Notifications.getNotificationChannelsAsync().then((value) =>
        setChannels(value ?? [])
      );
    }
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const [forms, setForms] = useState<any>(null);

  const init = async () => {
    const response: any = await get("form/getAllForms");
    setForms(response.data);
  };

  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row" }}>
          <IconButton
            icon="account-circle"
            iconColor="#000000"
            size={35}
            onPress={() => router.navigate(`/loggedIn/userProfile`)}
          />
        </View>
      ),
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      init();
      return () => {
        setForms(null);
      };
    }, [])
  );

  return (
    forms && (
      <ScrollView style={{ flexGrow: 1 }}>
        <View style={{ margin: 20 }}>
          {forms.length > 0 ? (
            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontWeight: "bold", fontSize: 25, paddingTop: 4 }}>
                {forms.length} {forms.length > 1 ? "Forms" : "Form"}
              </Text>
              <View style={{ flex: 1 }}></View>
              <Button
                style={{ width: "auto", alignSelf: "center" }}
                mode="contained"
                onPress={() => router.navigate(`/loggedIn/form/null`)}
              >
                Create Form
              </Button>
            </View>
          ) : (
            <Button
              style={{ width: "auto", alignSelf: "center" }}
              mode="contained"
              onPress={() => router.navigate(`/loggedIn/form/null`)}
            >
              Create Form
            </Button>
          )}
          <View style={{ marginTop: 10 }}>
            {forms.map((form: any) => (
              <Card key={form._id} style={{ marginTop: 10 }}>
                <Card.Content>
                  <Text style={{ fontWeight: "bold", fontSize: 20 }}>
                    {form.title}
                  </Text>
                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        color: "darkblue",
                        fontWeight: "bold",
                        textDecorationLine: "underline",
                        marginTop: 5,
                        marginRight: 20,
                        fontSize: 18,
                      }}
                      onPress={() =>
                        Linking.openURL(`https://callee.app/${form.urlPath}`)
                      }
                    >
                      callee.app/{form.urlPath}
                    </Text>
                    <Button
                      mode="text"
                      icon="share"
                      onPress={() => {
                        sharePaymentLink(
                          form.title,
                          `https://callee.app/${form.urlPath}`
                        );
                      }}
                    >
                      Share
                    </Button>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 5,
                      marginBottom: 5,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 18,
                        color: "darkgreen",
                      }}
                    >
                      {form.submissionCount}{" "}
                      {form.submissionCount > 1 ? "Submissions" : "Submission"}
                    </Text>
                    <View style={{ flex: 1 }}></View>
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 18,
                        color: "darkgreen",
                      }}
                    >
                      ₹{form.amountCollected} Collected
                    </Text>
                  </View>
                  <Button
                    style={{
                      width: "auto",
                      alignSelf: "center",
                      marginTop: 10,
                    }}
                    mode="outlined"
                    onPress={() =>
                      router.navigate(`/loggedIn/submission/${form._id}`)
                    }
                  >
                    View Submissions
                  </Button>
                  <Divider
                    bold={true}
                    style={{ marginTop: 15, marginBottom: 5 }}
                  />

                  <View style={{ flexDirection: "row" }}>
                    <IconButton
                      icon="delete"
                      onPress={() => {
                        Alert.alert("Delete", "Are you sure to delete form", [
                          {
                            text: "Cancel",
                            style: "cancel",
                          },
                          {
                            text: "Yes",
                            onPress: () => {
                              deleteForm(form._id);
                            },
                          },
                        ]);
                      }}
                    />
                    <View style={{ flex: 1 }}></View>
                    <Text
                      style={{
                        marginTop: 20,
                        color: form.status == "ACTIVE" ? "green" : "darkred",
                      }}
                    >
                      {form.status == "ACTIVE" ? "Active" : "Inactive"}
                    </Text>
                    <View style={{ flex: 1 }}></View>
                    <Button
                      mode="text"
                      icon="pencil"
                      onPress={() =>
                        router.navigate(`/loggedIn/form/${form._id}`)
                      }
                      style={{ marginTop: 8 }}
                    >
                      Edit
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    )
  );
};

export default form;

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      // alert("Failed to get push token for push notification!");
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error("Project ID not found");
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      await post(
        "user/updateExpoPushToken",
        { expoPushToken: token },
        undefined,
        undefined,
        false
      );
    } catch (e) {
      token = `${e}`;
    }
  } else {
    // alert("Must use physical device for Push Notifications");
  }

  return token;
}
