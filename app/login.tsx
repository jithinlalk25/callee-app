import { Linking, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Button, Text, TextInput } from "react-native-paper";
import { post } from "../utils/apiService";
import useStore from "../utils/useStore";
import { router } from "expo-router";

async function sendOtp(phoneNumber: string, setOtpSend: any) {
  await post("auth/sendOtp", { phoneNumber });
  setOtpSend(true);
}

async function verifyOtp(phoneNumber: string, otp: string, setToken: any) {
  const response = await post("auth/verifyOtp", {
    phoneNumber,
    otp,
  });
  setToken(response?.data.token);
  router.replace("/loggedIn");
}

const login = () => {
  const { setToken } = useStore();
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

  return (
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
          {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}
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

              verifyOtp(phoneNumber, otp, setToken);
            }}
          >
            Login
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
                Linking.openURL(
                  "https://sites.google.com/view/rate-india-terms/home"
                )
              }
            >
              Terms & Conditions
            </Text>
            ,
            <Text
              style={{
                color: "darkblue",
                fontWeight: "bold",
                textDecorationLine: "underline",
              }}
              onPress={() =>
                Linking.openURL(
                  "https://sites.google.com/view/rateindia-privacypolicy/home"
                )
              }
            >
              Privacy Policy
            </Text>{" "}
            &{" "}
            <Text
              style={{
                color: "darkblue",
                fontWeight: "bold",
                textDecorationLine: "underline",
              }}
              onPress={() =>
                Linking.openURL(
                  "https://sites.google.com/view/rate-india-disclaimer/home"
                )
              }
            >
              Disclaimer
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
  );
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
