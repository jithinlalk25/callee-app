import { Linking, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Button, Text, TextInput } from "react-native-paper";
import { get, post } from "../utils/apiService";
import useStore from "../utils/useStore";
import { router } from "expo-router";
import { getSecureStoreData } from "../utils/secureStore";

async function addName(name: string) {
  await post("user/addName", { name });
  router.replace("/loggedIn");
}

async function sendOtp(phoneNumber: string, setOtpSend: any) {
  await post("auth/sendOtp", { phoneNumber });
  setOtpSend(true);
}

async function sendOtpEmail(email: string, setEmailOtpSend: any) {
  await post("user/sendEmailOtp", { email });
  setEmailOtpSend(true);
}

async function verifyOtp(
  phoneNumber: string,
  otp: string,
  setToken: any,
  setScreen: any
) {
  const response: any = await post("auth/verifyOtp", {
    phoneNumber,
    otp,
  });
  setToken(response?.data.token);
  // setScreen("email");
  if (!response.data.user.email) {
    setScreen("email");
  } else if (!response.data.user.name) {
    setScreen("name");
  } else {
    router.replace("/loggedIn");
  }
  // router.replace("/loggedIn");
}

async function verifyOtpEmail(email: string, otp: string, setScreen: any) {
  const response: any = await post("user/verifyEmailOtp", {
    email,
    otp,
  });
  // setToken(response?.data.token);
  setScreen("name");
  // router.replace("/loggedIn");
}

const login = () => {
  const { setToken } = useStore();

  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [screen, setScreen] = useState("phoneNumber");

  const init = async () => {
    const token = await getSecureStoreData("token");
    console.log("======token=====", token);
    setToken(token || "");

    if (token) {
      const response: any = await get("user");
      console.log("======user=====", response.data);
      if (!response.data.email) {
        setScreen("email");
        setTokenLoaded(true);
      } else if (!response.data.name) {
        console.log("===asdf");
        setScreen("name");
        setTokenLoaded(true);
      } else {
        router.replace("/loggedIn");
      }
    } else {
      setTokenLoaded(true);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSend, setOtpSend] = useState(false);
  const [counter, setCounter] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    let timer: any;
    if (counter > 0) {
      timer = setTimeout(() => setCounter(counter - 1), 1000);
    } else if (counter === 0 && hasStarted) {
      setIsButtonDisabled(false);
      setHasStarted(false);
    }
    return () => clearTimeout(timer);
  }, [counter, hasStarted]);

  const handleStart = () => {
    setCounter(30);
    setIsButtonDisabled(true);
    setHasStarted(true);
  };

  const handleResend = () => {
    handleStart();
    sendOtp(phoneNumber, setOtpSend);
  };

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpError, setEmailOtpError] = useState("");
  const [emailOtpSend, setEmailOtpSend] = useState(false);
  const [counterEmail, setCounterEmail] = useState(0);
  const [isButtonDisabledEmail, setIsButtonDisabledEmail] = useState(false);
  const [hasStartedEmail, setHasStartedEmail] = useState(false);

  useEffect(() => {
    let timer: any;
    if (counterEmail > 0) {
      timer = setTimeout(() => setCounterEmail(counterEmail - 1), 1000);
    } else if (counterEmail === 0 && hasStartedEmail) {
      setIsButtonDisabledEmail(false);
      setHasStartedEmail(false);
    }
    return () => clearTimeout(timer);
  }, [counterEmail, hasStartedEmail]);

  const handleStartEmail = () => {
    setCounterEmail(30);
    setIsButtonDisabledEmail(true);
    setHasStartedEmail(true);
  };

  const handleResendEmail = () => {
    handleStartEmail();
    sendOtpEmail(email, setEmailOtpSend);
  };

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");

  return tokenLoaded ? (
    <View
      style={{
        flex: 1,
        margin: 20,
      }}
    >
      <Text
        style={{
          alignSelf: "center",
          marginTop: "5%",
          fontSize: 50,
          fontWeight: "bold",
        }}
      >
        Callee
      </Text>
      {screen == "phoneNumber" && (
        <View>
          <Text
            style={{
              marginTop: "10%",
              fontSize: 25,
            }}
          >
            Enter your Phone Number
          </Text>
          <TextInput
            style={{
              marginTop: 5,
              fontSize: 20,
              height: 60,
            }}
            outlineStyle={{ borderRadius: 10 }}
            autoFocus={true}
            mode="outlined"
            label="Phone Number"
            value={phoneNumber}
            disabled={otpSend}
            onChangeText={(data) => {
              setPhoneNumberError("");
              setPhoneNumber(data);
            }}
            keyboardType="numeric"
            error={!!phoneNumberError}
            maxLength={10}
          />
          {phoneNumberError ? (
            <Text style={styles.errorText}>{phoneNumberError}</Text>
          ) : null}

          {otpSend ? (
            <View>
              <TextInput
                mode="outlined"
                style={{
                  marginTop: 5,
                  fontSize: 20,
                  height: 60,
                }}
                outlineStyle={{ borderRadius: 10 }}
                autoFocus={true}
                label="OTP"
                value={otp}
                onChangeText={(data) => {
                  setOtpError("");
                  setOtp(data);
                }}
                keyboardType="numeric"
                maxLength={6}
              />
              {otpError ? (
                <Text style={styles.errorText}>{otpError}</Text>
              ) : null}
              <Button
                style={{
                  width: 150,
                  alignSelf: "flex-end",
                  marginTop: 10,
                  marginRight: 10,
                }}
                mode="contained"
                onPress={() => {
                  if (otp.length < 6) {
                    setOtpError("Invalid OTP");
                    return;
                  }

                  verifyOtp(phoneNumber, otp, setToken, setScreen);
                }}
              >
                Verify
              </Button>
              {isButtonDisabled ? (
                <Button
                  style={{
                    width: "auto",
                    alignSelf: "flex-end",
                    marginTop: 10,
                    marginRight: 10,
                  }}
                  mode="text"
                  disabled={true}
                >
                  Resend OTP in {counter} seconds
                </Button>
              ) : (
                <Button
                  style={{
                    width: 150,
                    alignSelf: "flex-end",
                    marginTop: 10,
                    marginRight: 10,
                  }}
                  mode="text"
                  onPress={() => handleResend()}
                >
                  Resend OTP
                </Button>
              )}
            </View>
          ) : (
            <View>
              <Text style={{ marginTop: 10 }}>
                By clicking 'Get OTP' I agree to the{" "}
                <Text
                  style={{
                    color: "darkblue",
                    fontWeight: "bold",
                    textDecorationLine: "underline",
                  }}
                  onPress={() =>
                    Linking.openURL("https://www.callee.app/terms-conditions")
                  }
                >
                  Terms & Conditions
                </Text>
                {" and "}
                <Text
                  style={{
                    color: "darkblue",
                    fontWeight: "bold",
                    textDecorationLine: "underline",
                  }}
                  onPress={() =>
                    Linking.openURL("https://www.callee.app/privacy-policy")
                  }
                >
                  Privacy Policy
                </Text>
              </Text>

              <Button
                style={{
                  width: 150,
                  alignSelf: "flex-end",
                  marginTop: 10,
                  marginRight: 10,
                }}
                mode="contained"
                onPress={() => {
                  if (phoneNumber.length != 10) {
                    setPhoneNumberError("Invalid Phone Number");
                    return;
                  }
                  handleStart();
                  sendOtp(phoneNumber, setOtpSend);
                }}
              >
                Get OTP
              </Button>
            </View>
          )}
        </View>
      )}
      {screen == "email" && (
        <View>
          <Text
            style={{
              marginTop: "10%",
              fontSize: 25,
            }}
          >
            Enter your Email
          </Text>
          <TextInput
            style={{
              marginTop: 5,
              fontSize: 20,
              height: 60,
            }}
            outlineStyle={{ borderRadius: 10 }}
            autoFocus={true}
            mode="outlined"
            label="Email"
            value={email}
            disabled={emailOtpSend}
            onChangeText={(data) => {
              setEmailError("");
              setEmail(data);
            }}
            error={!!emailError}
          />
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}

          {emailOtpSend ? (
            <View>
              <TextInput
                mode="outlined"
                style={{
                  marginTop: 5,
                  fontSize: 20,
                  height: 60,
                }}
                outlineStyle={{ borderRadius: 10 }}
                autoFocus={true}
                label="OTP"
                value={emailOtp}
                onChangeText={(data) => {
                  setEmailOtpError("");
                  setEmailOtp(data);
                }}
                keyboardType="numeric"
                maxLength={6}
              />
              {emailOtpError ? (
                <Text style={styles.errorText}>{emailOtpError}</Text>
              ) : null}
              <Button
                style={{
                  width: 150,
                  alignSelf: "flex-end",
                  marginTop: 10,
                  marginRight: 10,
                }}
                mode="contained"
                onPress={() => {
                  if (emailOtp.length < 6) {
                    setEmailOtpError("Invalid OTP");
                    return;
                  }

                  verifyOtpEmail(email, emailOtp, setScreen);
                }}
              >
                Verify
              </Button>
              {isButtonDisabledEmail ? (
                <Button
                  style={{
                    width: "auto",
                    alignSelf: "flex-end",
                    marginTop: 10,
                    marginRight: 10,
                  }}
                  mode="text"
                  disabled={true}
                >
                  Resend OTP in {counterEmail} seconds
                </Button>
              ) : (
                <Button
                  style={{
                    width: 150,
                    alignSelf: "flex-end",
                    marginTop: 10,
                    marginRight: 10,
                  }}
                  mode="text"
                  onPress={() => handleResendEmail()}
                >
                  Resend OTP
                </Button>
              )}
            </View>
          ) : (
            <View>
              <Button
                style={{
                  width: 150,
                  alignSelf: "flex-end",
                  marginTop: 10,
                  marginRight: 10,
                }}
                mode="contained"
                onPress={() => {
                  // if (phoneNumber.length != 10) {
                  //   setPhoneNumberError("Invalid Phone Number");
                  //   return;
                  // }
                  handleStartEmail();
                  sendOtpEmail(email, setEmailOtpSend);
                }}
              >
                Get OTP
              </Button>
            </View>
          )}
        </View>
      )}
      {screen == "name" && (
        <View>
          <Text
            style={{
              marginTop: "10%",
              fontSize: 25,
            }}
          >
            Enter your Name
          </Text>
          <TextInput
            style={{
              marginTop: 5,
              fontSize: 20,
              height: 60,
            }}
            outlineStyle={{ borderRadius: 10 }}
            autoFocus={true}
            mode="outlined"
            label="Name"
            value={name}
            onChangeText={(data) => {
              setNameError("");
              setName(data);
            }}
            error={!!nameError}
          />
          {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

          <View>
            <Button
              style={{
                width: 150,
                alignSelf: "flex-end",
                marginTop: 10,
                marginRight: 10,
              }}
              mode="contained"
              onPress={() => {
                addName(name);
              }}
            >
              Continue
            </Button>
          </View>
        </View>
      )}
    </View>
  ) : null;
};

export default login;

const styles = StyleSheet.create({
  errorText: {
    color: "red",
    marginTop: 8,
  },
});

export const stackOptions = {
  headerShown: false,
};
