import { View, Text, ScrollView, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { Button, TextInput } from "react-native-paper";
import { get, post } from "../../../utils/apiService";

const account = () => {
  const [street1, setStreet1] = useState("");
  const [street1Error, setStreet1Error] = useState("");
  const [street2, setStreet2] = useState("");
  const [street2Error, setStreet2Error] = useState("");
  const [city, setCity] = useState("");
  const [cityError, setCityError] = useState("");
  const [state, setState] = useState("");
  const [stateError, setStateError] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [postalCodeError, setPostalCodeError] = useState("");

  const [accountNumber, setAccountNumber] = useState("");
  const [accountNumberError, setAccountNumberError] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [ifscError, setIfscError] = useState("");

  const [hasAddress, setHasAddress] = useState(false);
  const [editAddress, setEditAddress] = useState(false);
  const [hasBankAccount, setHasBankAccount] = useState(false);
  const [editBankAccount, setEditBankAccount] = useState(false);

  const [account, setAccount] = useState<any>(null);

  const init = async () => {
    const response: any = await get("payment/getAccount");
    console.log("=============+", response.data);
    setAccount(response.data);
    if (response.data.address) {
      setStreet1(response.data.address.street1);
      setStreet2(response.data.address.street2);
      setCity(response.data.address.city);
      setState(response.data.address.state);
      setPostalCode(response.data.address.postalCode);
      setHasAddress(true);
    }

    if (response.data.bankAccount) {
      setAccountNumber(response.data.bankAccount.accountNumber);
      setIfsc(response.data.bankAccount.ifsc);
      setHasBankAccount(true);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const saveAddress = async () => {
    const response: any = await post("payment/saveAddress", {
      street1: street1.trim(),
      street2: street2.trim(),
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
    });
    console.log("=============", response.data);
    setEditAddress(false);
    setStreet1(response.data.address.street1);
    setStreet2(response.data.address.street2);
    setCity(response.data.address.city);
    setState(response.data.address.state);
    setPostalCode(response.data.address.postalCode);
    setAccount(response.data);
  };

  const saveBankAccount = async () => {
    const response: any = await post("payment/saveBankAccount", {
      accountNumber: accountNumber.trim(),
      ifsc: ifsc.trim(),
    });
    console.log("=============", response.data);
    setEditBankAccount(false);
    setAccountNumber(response.data.bankAccount.accountNumber);
    setIfsc(response.data.bankAccount.ifsc);
  };

  return (
    <ScrollView style={{ flexGrow: 1 }}>
      <View style={{ margin: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Address</Text>
        {hasAddress ? (
          <View>
            <View>
              <TextInput
                disabled={!editAddress}
                style={{ marginTop: 10 }}
                outlineStyle={{ borderRadius: 10 }}
                mode="outlined"
                label="Street 1"
                error={street1Error.length > 0}
                value={street1}
                onChangeText={(text) => {
                  setStreet1(text);
                  setStreet1Error("");
                }}
              />
              {street1Error.length > 0 && (
                <Text style={styles.errorText}>{street1Error}</Text>
              )}
              {/* <Text style={{ alignSelf: "flex-end", marginRight: 5 }}>
          Min ₹10 - Max ₹10000
        </Text> */}
            </View>
            <View>
              <TextInput
                disabled={!editAddress}
                style={{ marginTop: 10 }}
                outlineStyle={{ borderRadius: 10 }}
                mode="outlined"
                label="Street 2"
                error={street2Error.length > 0}
                value={street2}
                onChangeText={(text) => {
                  setStreet2(text);
                  setStreet2Error("");
                }}
              />
              {street2Error.length > 0 && (
                <Text style={styles.errorText}>{street2Error}</Text>
              )}
              {/* <Text style={{ alignSelf: "flex-end", marginRight: 5 }}>
          Min ₹10 - Max ₹10000
        </Text> */}
            </View>

            <View>
              <TextInput
                disabled={!editAddress}
                style={{ marginTop: 10 }}
                outlineStyle={{ borderRadius: 10 }}
                mode="outlined"
                label="City"
                error={cityError.length > 0}
                value={city}
                onChangeText={(text) => {
                  setCity(text);
                  setCityError("");
                }}
              />
              {cityError.length > 0 && (
                <Text style={styles.errorText}>{cityError}</Text>
              )}
              {/* <Text style={{ alignSelf: "flex-end", marginRight: 5 }}>
          Min ₹10 - Max ₹10000
        </Text> */}
            </View>
            <View>
              <TextInput
                disabled={!editAddress}
                style={{ marginTop: 10 }}
                outlineStyle={{ borderRadius: 10 }}
                mode="outlined"
                label="State"
                error={stateError.length > 0}
                value={state}
                onChangeText={(text) => {
                  setState(text);
                  setStateError("");
                }}
              />
              {stateError.length > 0 && (
                <Text style={styles.errorText}>{stateError}</Text>
              )}
              {/* <Text style={{ alignSelf: "flex-end", marginRight: 5 }}>
          Min ₹10 - Max ₹10000
        </Text> */}
            </View>
            <View>
              <TextInput
                disabled={!editAddress}
                style={{ marginTop: 10 }}
                outlineStyle={{ borderRadius: 10 }}
                mode="outlined"
                label="Postal Code"
                error={postalCodeError.length > 0}
                value={postalCode}
                onChangeText={(text) => {
                  setPostalCode(text);
                  setPostalCodeError("");
                }}
              />
              {postalCodeError.length > 0 && (
                <Text style={styles.errorText}>{postalCodeError}</Text>
              )}
              {/* <Text style={{ alignSelf: "flex-end", marginRight: 5 }}>
          Min ₹10 - Max ₹10000
        </Text> */}
            </View>

            {editAddress ? (
              <View style={{ flexDirection: "row" }}>
                <Button
                  style={{ marginTop: 10 }}
                  mode="outlined"
                  onPress={() => setEditAddress(false)}
                >
                  Cancel
                </Button>
                <View style={{ flex: 1 }}></View>
                <Button
                  style={{ marginTop: 10 }}
                  mode="contained"
                  onPress={saveAddress}
                >
                  Save
                </Button>
              </View>
            ) : (
              <Button
                style={{ alignSelf: "flex-end", marginTop: 10 }}
                mode="outlined"
                onPress={() => setEditAddress(true)}
              >
                Edit
              </Button>
            )}
          </View>
        ) : (
          <Button
            style={{ alignSelf: "flex-start", marginTop: 10 }}
            mode="contained"
            onPress={() => {
              setEditAddress(true);
              setHasAddress(true);
            }}
          >
            Add Address
          </Button>
        )}
        <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 10 }}>
          Bank Account
        </Text>
        {hasBankAccount ? (
          <View>
            <View>
              <TextInput
                disabled={!editBankAccount}
                style={{ marginTop: 10 }}
                outlineStyle={{ borderRadius: 10 }}
                mode="outlined"
                label="Account Number"
                error={accountNumberError.length > 0}
                value={accountNumber}
                keyboardType="numeric"
                onChangeText={(text) => {
                  setAccountNumber(text);
                  setAccountNumberError("");
                }}
              />
              {accountNumberError.length > 0 && (
                <Text style={styles.errorText}>{accountNumberError}</Text>
              )}
              {/* <Text style={{ alignSelf: "flex-end", marginRight: 5 }}>
          Min ₹10 - Max ₹10000
        </Text> */}
            </View>
            <View>
              <TextInput
                disabled={!editBankAccount}
                style={{ marginTop: 10 }}
                outlineStyle={{ borderRadius: 10 }}
                mode="outlined"
                label="IFSC"
                autoCapitalize="characters"
                error={ifscError.length > 0}
                value={ifsc}
                onChangeText={(text) => {
                  setIfsc(text);
                  setIfscError("");
                }}
              />
              {ifscError.length > 0 && (
                <Text style={styles.errorText}>{ifscError}</Text>
              )}
              {/* <Text style={{ alignSelf: "flex-end", marginRight: 5 }}>
          Min ₹10 - Max ₹10000
        </Text> */}
            </View>

            {editBankAccount ? (
              <View style={{ flexDirection: "row" }}>
                <Button
                  style={{ marginTop: 10 }}
                  mode="outlined"
                  onPress={() => setEditBankAccount(false)}
                >
                  Cancel
                </Button>
                <View style={{ flex: 1 }}></View>
                <Button
                  style={{ marginTop: 10 }}
                  mode="contained"
                  onPress={saveBankAccount}
                >
                  Save
                </Button>
              </View>
            ) : (
              <Button
                style={{ alignSelf: "flex-end", marginTop: 10 }}
                mode="outlined"
                onPress={() => setEditBankAccount(true)}
              >
                Edit
              </Button>
            )}
          </View>
        ) : (
          <Button
            style={{ alignSelf: "flex-start", marginTop: 10 }}
            disabled={!account?.address}
            mode="contained"
            onPress={() => {
              setEditBankAccount(true);
              setHasBankAccount(true);
            }}
          >
            Add Bank Account
          </Button>
        )}
      </View>
    </ScrollView>
  );
};

export default account;

const styles = StyleSheet.create({
  errorText: {
    color: "red",
    // marginTop: 8,
  },
});
