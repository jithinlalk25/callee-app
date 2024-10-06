import { View, Text, Alert, FlatList } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  Dialog,
  IconButton,
  Portal,
  RadioButton,
  TextInput,
} from "react-native-paper";
import { get, post } from "../../../utils/apiService";
import { router, useFocusEffect } from "expo-router";

const formatDate = (date: string) => {
  const dateObj = new Date(date);
  const readableDate = dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short", // Short form of the month
    day: "numeric",
  });

  // Format the time
  const readableTime = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${readableTime}, ${readableDate}`;
};

enum AccountTypeEnum {
  BANK = "BANK",
  UPI = "UPI",
}

const TransferStatusColorMap: any = {
  PENDING: "blue",
  FAILED: "darkred",
  SUCCESS: "green",
};

const withdraw = async () => {
  const response: any = await post("payment/withdraw", {});
};

const updateAccount = async (
  accountType: AccountTypeEnum,
  bankAccountNumber: string,
  bankIfsc: string,
  vpa: string
) => {
  const params =
    accountType == AccountTypeEnum.BANK
      ? {
          bankAccountNumber,
          bankIfsc,
        }
      : {
          vpa,
        };
  const response: any = await post("payment/addAccount", {
    type: accountType,
    ...params,
  });
  return response;
};

const deleteAccount = async () => {
  const response: any = await post("payment/deleteAccount", {});

  return response.data;
};

const wallet = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [accountType, setAccountType] = useState(AccountTypeEnum.BANK);
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [vpa, setVpa] = useState("");
  const [withdrawals, setWithdrawals] = useState([]);

  const init = async () => {
    const response: any = await get("payment/getWallet");
    setWallet(response.data);
    if (response.data.account) {
      setAccountType(response.data.account.type);
      if (response.data.account.type == AccountTypeEnum.BANK) {
        setBankAccountNumber(response.data.account.bankAccountNumber);
        setBankIfsc(response.data.account.bankIfsc);
        setVpa("");
      } else {
        setBankAccountNumber("");
        setBankIfsc("");
        setVpa(response.data.account.vpa);
      }
    } else {
      setAccountType(AccountTypeEnum.BANK);
      setBankAccountNumber("");
      setBankIfsc("");
      setVpa("");
    }

    const response1: any = await post("payment/getWithdrawals");
    setWithdrawals(response1.data);
  };

  useFocusEffect(
    useCallback(() => {
      init();
      return () => {
        setWallet(null);
      };
    }, [])
  );

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          padding: 10,
          marginBottom: 1,
          borderRadius: 10,
          backgroundColor: "white",
        }}
      >
        <Text style={{ fontWeight: "bold" }}>₹{item.amount}</Text>
        <View style={{ flex: 1 }}></View>
        <Text style={{ color: TransferStatusColorMap[item.status] }}>
          {item.status}
        </Text>
        <View style={{ flex: 1 }}></View>
        <Text>{formatDate(item.createdAt)}</Text>
      </View>
    );
  };

  return (
    wallet && (
      <View style={{ margin: 20 }}>
        <Portal>
          <Dialog visible={dialogVisible} dismissable={false}>
            <Dialog.Title style={{ alignSelf: "center" }}>
              Update account
            </Dialog.Title>
            <Dialog.Content>
              <RadioButton.Group
                onValueChange={(data: any) => {
                  setAccountType(data);
                }}
                value={accountType}
              >
                <View style={{ flexDirection: "row" }}>
                  <RadioButton.Item
                    labelStyle={{ fontWeight: "bold" }}
                    label="Bank Account"
                    value={AccountTypeEnum.BANK}
                  />
                  <RadioButton.Item
                    labelStyle={{ fontWeight: "bold" }}
                    label="UPI"
                    value={AccountTypeEnum.UPI}
                  />
                </View>
              </RadioButton.Group>

              {accountType == AccountTypeEnum.BANK ? (
                <>
                  <TextInput
                    style={{
                      // fontSize: 20,
                      marginTop: 10,
                    }}
                    outlineStyle={{ borderRadius: 10 }}
                    mode="outlined"
                    label="Account Number"
                    keyboardType="numeric"
                    value={bankAccountNumber}
                    // error={quantityFieldNameError.length > 0}
                    onChangeText={(text) => {
                      setBankAccountNumber(text);
                    }}
                  />
                  <TextInput
                    style={{
                      // fontSize: 20,
                      marginTop: 10,
                    }}
                    outlineStyle={{ borderRadius: 10 }}
                    mode="outlined"
                    label="IFSC"
                    value={bankIfsc}
                    // error={quantityFieldNameError.length > 0}
                    onChangeText={(text) => {
                      setBankIfsc(text);
                    }}
                  />
                </>
              ) : (
                <TextInput
                  style={{
                    // fontSize: 20,
                    marginTop: 10,
                  }}
                  outlineStyle={{ borderRadius: 10 }}
                  mode="outlined"
                  label="UPI"
                  value={vpa}
                  // error={quantityFieldNameError.length > 0}
                  onChangeText={(text) => {
                    setVpa(text);
                  }}
                />
              )}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
              <Button
                disabled={
                  accountType == AccountTypeEnum.BANK
                    ? bankAccountNumber.trim().length < 1 ||
                      bankIfsc.trim().length < 1
                    : vpa.trim().length < 1
                }
                onPress={async () => {
                  const response = await updateAccount(
                    accountType,
                    bankAccountNumber,
                    bankIfsc,
                    vpa
                  );
                  if (response) {
                    setDialogVisible(false);
                    init();
                  }
                }}
              >
                Save
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <Card
          style={{
            paddingTop: 10,
            paddingBottom: 10,
            backgroundColor: "lightblue",
          }}
        >
          <Card.Content style={{ alignItems: "center" }}>
            <Text style={{ fontWeight: "bold", fontSize: 50 }}>
              ₹{wallet.balance}
            </Text>
            <Text>Wallet Balance</Text>
            <Button
              mode="contained"
              style={{ marginTop: 20 }}
              onPress={() => {
                Alert.alert(
                  "Withdraw",
                  "Wallet balance will be transferred to your account",
                  [
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                    {
                      text: "Confirm",
                      onPress: async () => {
                        await withdraw();
                        init();
                      },
                    },
                  ]
                );
              }}
              disabled={wallet.balance <= 0 || !wallet.account}
            >
              Withdraw
            </Button>
          </Card.Content>
        </Card>
        <View>
          {wallet.account && (
            <Card style={{ marginTop: 10 }}>
              <Card.Content style={{ alignItems: "center" }}>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                      {accountType == AccountTypeEnum.BANK
                        ? "Bank Account"
                        : "UPI"}
                    </Text>
                    <Text
                      style={{
                        color: "darkblue",
                        marginTop: 5,
                        fontWeight: "bold",
                      }}
                    >
                      {accountType == AccountTypeEnum.BANK
                        ? `${bankAccountNumber}\n${bankIfsc}`
                        : `${vpa}`}
                    </Text>
                  </View>
                  <View style={{}}>
                    <IconButton
                      style={{ margin: 0, padding: 0 }}
                      icon="pencil"
                      onPress={() => setDialogVisible(true)}
                    />
                    <IconButton
                      style={{ margin: 0, padding: 0 }}
                      icon="delete"
                      onPress={() => {
                        Alert.alert(
                          "Delete",
                          "Are you sure to delete account",
                          [
                            {
                              text: "Cancel",
                              style: "cancel",
                            },
                            {
                              text: "Yes",
                              onPress: async () => {
                                const response = await deleteAccount();
                                init();
                              },
                            },
                          ]
                        );
                      }}
                    />

                    {/* <Button
                      mode="text"
                      icon="pencil"
                      onPress={() => setDialogVisible(true)}
                      style={{ marginTop: 8 }}
                    >
                      Edit
                    </Button> */}
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}

          {!wallet.account && (
            <Button
              icon="plus"
              mode="outlined"
              style={{ marginTop: 20, width: "auto", alignSelf: "center" }}
              onPress={() => {
                setDialogVisible(true);
              }}
            >
              Add account to withdraw
            </Button>
          )}
        </View>
        {withdrawals.length > 0 && (
          <View style={{ marginTop: 10 }}>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 10 }}>
                Withdrawals
              </Text>
              <View style={{ flex: 1 }}></View>

              <Button
                mode="text"
                icon="refresh"
                onPress={() => init()}
                style={{ marginTop: 5 }}
              >
                Refresh
              </Button>
            </View>
            <FlatList
              // ListHeaderComponent={HeaderComponent}
              style={{ marginTop: 10 }}
              data={withdrawals}
              renderItem={renderItem}
              keyExtractor={(item) => item._id}
              // onEndReached={handleLoadMore}
              // onEndReachedThreshold={0.5}
              // onMomentumScrollBegin={() => {
              //   setOnEndReachedCalledDuringMomentum(false);
              // }}
              // ListFooterComponent={renderFooter}
            />
          </View>
        )}
      </View>
    )
  );
};

export default wallet;
