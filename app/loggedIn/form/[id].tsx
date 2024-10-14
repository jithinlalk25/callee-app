import { View, Text, ScrollView, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import {
  Button,
  Checkbox,
  Icon,
  IconButton,
  RadioButton,
  Switch,
  TextInput,
} from "react-native-paper";
import { post } from "../../../utils/apiService";

export enum AmountTypeEnum {
  FIXED = "FIXED",
  CUSTOM = "CUSTOM",
  QUANTITY = "QUANTITY",
}

enum FeeCollectedFromEnum {
  PAYER = "PAYER",
  PAYEE = "PAYEE",
}

export enum FormStatusEnum {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

const save = async (
  title: string,
  description: string,
  amountType: AmountTypeEnum,
  amount: string,
  quantityFieldName: string,
  fields: any[],
  id: string,
  isActive: boolean,
  expiry: string,
  feeCollectedFrom: FeeCollectedFromEnum
) => {
  const data: any = {
    title,
    description,
    amountType,
    fields,
    feeCollectedFrom,
  };
  if ([AmountTypeEnum.FIXED, AmountTypeEnum.QUANTITY].includes(amountType)) {
    data["amount"] = Number(amount);
  }

  if (amountType == AmountTypeEnum.QUANTITY) {
    data["quantityField"] = { name: quantityFieldName };
  }

  data["status"] = isActive ? FormStatusEnum.ACTIVE : FormStatusEnum.INACTIVE;
  data["expiry"] = expiry.length > 0 ? expiry : null;

  if (id == "null") {
    await post("form/createForm", data);
  } else {
    await post("form/updateForm", { formId: id, ...data });
  }

  router.navigate("/loggedIn/form");
};

const form = () => {
  const { id }: { id: string } = useLocalSearchParams();
  const navigation = useNavigation();

  const [amountType, setAmountType] = useState(AmountTypeEnum.FIXED);
  const [amount, setAmount] = useState("10");
  const [amountError, setAmountError] = useState("");
  const [quantityFieldName, setQuantityFieldName] = useState("Quantity");
  const [quantityFieldNameError, setQuantityFieldNameError] = useState("");
  const [fields, setFields] = useState<any>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState("");
  const [expiryCheckbox, setExpiryCheckbox] = useState(false);
  const [expiry, setExpiry] = useState("");
  const [expiryError, setExpiryError] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [feeCollectedFrom, setFeeCollectedFrom] = useState(
    FeeCollectedFromEnum.PAYER
  );

  const init = async () => {
    let screenTitle = "";
    if (id == "null") {
      screenTitle = "Create Form";
    } else {
      screenTitle = "Edit Form";

      const response: any = await post("form/getForm", {
        formId: id,
      });

      setTitle(response.data.title);
      setDescription(response.data.description);
      setAmountType(response.data.amountType);
      if (
        [AmountTypeEnum.FIXED, AmountTypeEnum.QUANTITY].includes(
          response.data.amountType
        )
      ) {
        setAmount(response.data.amount.toString());
      }

      if (response.data.amountType == AmountTypeEnum.QUANTITY) {
        setQuantityFieldName(response.data.quantityField.name);
      }

      if (response.data.expiry) {
        setExpiryCheckbox(true);
        setExpiry(response.data.expiry);
      }

      setFields(response.data.fields);

      // setTitle(response.data.title);
      // setDescription(response.data.description);
      // setDuration(response.data.duration);
      // setPrice(response.data.price);
      // if (response.data.price == PriceEnum.PAID) {
      //   setAmount(response.data.amount.toString());
      // }
    }

    navigation.setOptions({
      title: screenTitle,
    });
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row" }}>
          <Text
            style={{
              fontSize: 20,
              color: isActive ? "green" : "darkred",
              marginTop: 8,
            }}
          >
            {isActive ? "Active" : "Inactive"}
          </Text>
          <Switch
            value={isActive}
            onValueChange={() => setIsActive(!isActive)}
          />
        </View>
      ),
    });
  }, [isActive]);

  return (
    <ScrollView style={{ flexGrow: 1 }}>
      <View style={{ margin: 20 }}>
        <View>
          <TextInput
            outlineStyle={{ borderRadius: 10 }}
            mode="outlined"
            label="Title"
            error={titleError.length > 0}
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              setTitleError("");
            }}
          />
          {titleError.length > 0 && (
            <Text style={styles.errorText}>{titleError}</Text>
          )}
          {/* <Text style={{ alignSelf: "flex-end", marginRight: 5 }}>
          Min ₹10 - Max ₹10000
        </Text> */}
        </View>
        <TextInput
          style={{ marginTop: 10 }}
          outlineStyle={{ borderRadius: 10 }}
          mode="outlined"
          label="Description"
          value={description}
          multiline={true}
          numberOfLines={3}
          onChangeText={(text) => {
            setDescription(text);
          }}
        />
        <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 10 }}>
          Amount Type
        </Text>
        <RadioButton.Group
          onValueChange={(data: any) => {
            setAmountType(data);
          }}
          value={amountType}
        >
          <View style={{ flexDirection: "row" }}>
            <RadioButton.Item label="Fixed" value={AmountTypeEnum.FIXED} />
            <RadioButton.Item label="Custom" value={AmountTypeEnum.CUSTOM} />
            <RadioButton.Item
              label="Quantity"
              value={AmountTypeEnum.QUANTITY}
            />
          </View>
        </RadioButton.Group>

        {[AmountTypeEnum.FIXED, AmountTypeEnum.QUANTITY].includes(
          amountType
        ) && (
          <View>
            <TextInput
              style={{
                marginTop: 10,
              }}
              outlineStyle={{ borderRadius: 10 }}
              mode="outlined"
              label="Amount"
              value={amount}
              error={amountError.length > 0}
              keyboardType="numeric"
              left={
                <TextInput.Icon
                  icon={() => <Icon source="currency-inr" size={25} />}
                />
              }
              onChangeText={(text) => {
                setAmount(text.replace(/\D/g, ""));
                setAmountError("");
              }}
            />
            {amountError.length > 0 && (
              <Text style={styles.errorText}>{amountError}</Text>
            )}
            {/* <Text style={{ alignSelf: "flex-end", marginRight: 5 }}>
          Min ₹10 - Max ₹10000
        </Text> */}
          </View>
        )}

        {AmountTypeEnum.QUANTITY == amountType && (
          <View>
            <TextInput
              style={{
                // fontSize: 20,
                marginTop: 10,
              }}
              outlineStyle={{ borderRadius: 10 }}
              mode="outlined"
              label="Quantity Field Name"
              value={quantityFieldName}
              error={quantityFieldNameError.length > 0}
              onChangeText={(text) => {
                setQuantityFieldName(text);
                setQuantityFieldNameError("");
              }}
            />
            {quantityFieldNameError.length > 0 && (
              <Text style={styles.errorText}>{quantityFieldNameError}</Text>
            )}
            {/* <Text style={{ alignSelf: "flex-end", marginRight: 5 }}>
          Min ₹10 - Max ₹10000
        </Text> */}
          </View>
        )}

        <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 15 }}>
          Platform fee collected from
        </Text>
        <RadioButton.Group
          onValueChange={(data: any) => {
            setFeeCollectedFrom(data);
          }}
          value={feeCollectedFrom}
        >
          <View style={{ flexDirection: "row" }}>
            <RadioButton.Item
              label="Payer"
              value={FeeCollectedFromEnum.PAYER}
            />
            <RadioButton.Item
              label="Payee"
              value={FeeCollectedFromEnum.PAYEE}
            />
          </View>
        </RadioButton.Group>

        <View>
          <Text style={{ backgroundColor: "lightgray", padding: 5 }}>
            {feeCollectedFrom == FeeCollectedFromEnum.PAYER
              ? `Example: Amount = ₹100, Platform Fee = 3%\nPayer will pay ₹103 and Payee will get ₹100`
              : `Example: Amount = ₹100, Platform Fee = 3%\nPayer will pay ₹100 and Payee will get ₹97`}
          </Text>
        </View>

        <View style={{ flexDirection: "row", marginTop: 15 }}>
          <Checkbox.Android
            status={expiryCheckbox ? "checked" : "unchecked"}
            onPress={() => {
              setExpiryCheckbox(!expiryCheckbox);
            }}
          />
          <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 5 }}>
            Add Expiry
          </Text>
        </View>
        {expiryCheckbox && (
          <View>
            <TextInput
              style={{
                // fontSize: 20,
                marginTop: 10,
              }}
              outlineStyle={{ borderRadius: 10 }}
              mode="outlined"
              label="Date & Time"
              value={expiry}
              error={expiryError.length > 0}
              onChangeText={(text) => {
                setExpiry(text);
                setExpiryError("");
              }}
            />
            {expiryError.length > 0 && (
              <Text style={styles.errorText}>{expiryError}</Text>
            )}
            <Text style={{ alignSelf: "flex-end", marginRight: 5 }}>
              Format: 'DD/MM/YYYY-HH:MM' (24-Hour Format)
            </Text>
          </View>
        )}
        <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 20 }}>
          Fields
        </Text>
        {fields.map((field: any, index: number) => (
          <View key={index}>
            <View style={{ flexDirection: "row" }}>
              <TextInput
                style={{
                  // fontSize: 20,
                  flex: 1,
                  marginTop: 10,
                }}
                outlineStyle={{ borderRadius: 10 }}
                mode="outlined"
                label={`Field ${index + 1} Name`}
                value={fields[index].name}
                error={fields[index].errorText.length > 0}
                onChangeText={(text) =>
                  setFields((prevData: any[]) => {
                    return [
                      ...prevData.slice(0, index),
                      { name: text, id: prevData[index].id, errorText: "" },
                      ...prevData.slice(index + 1),
                    ];
                  })
                }
              />
              <IconButton
                style={{ margin: 0, padding: 0, marginTop: 17 }}
                icon="close-thick"
                size={30}
                onPress={() => {
                  setFields((prevData: any[]) => {
                    return [
                      ...prevData.slice(0, index),
                      ...prevData.slice(index + 1),
                    ];
                  });
                }}
                // iconColor="green"
              />
            </View>
            {fields[index].errorText.length > 0 && (
              <Text style={styles.errorText}>{fields[index].errorText}</Text>
            )}
            {/* <Text style={{ alignSelf: "flex-end", marginRight: 5 }}>
          Min ₹10 - Max ₹10000
        </Text> */}
          </View>
        ))}
        <Button
          style={{ width: "auto", alignSelf: "flex-start", marginTop: 10 }}
          mode="text"
          icon="plus"
          onPress={() => {
            setFields((prevData: any[]) => {
              return [
                ...prevData,
                { id: Date.now().toString(), name: "", errorText: "" },
              ];
            });
          }}
        >
          Add Field
        </Button>
        <Button
          style={{ width: "50%", alignSelf: "center", marginTop: 10 }}
          mode="contained"
          onPress={() => {
            const _title = title.trim();
            if (_title.length < 3) {
              setTitleError("Length should be atleast 3");
              return;
            }

            const _description = description.trim();

            const _amount = amount.trim();
            if (!Number.isInteger(Number(_amount))) {
              setAmountError("Invalid amount");
              return;
            }
            if (Number(_amount) < 10 || Number(_amount) > 50000) {
              setAmountError("Amount should be between ₹10 and ₹50000");
              return;
            }

            const _quantityFieldName = quantityFieldName.trim();
            if (AmountTypeEnum.QUANTITY == amountType) {
              if (_quantityFieldName.length < 3) {
                setQuantityFieldNameError("Length should be atleast 3");
                return;
              }
            }

            const _expiry = expiry.trim();
            if (expiryCheckbox) {
              const regex =
                /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}-(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/;
              if (!regex.test(_expiry)) {
                setExpiryError("Invalid format");
                return;
              }

              const [datePart, timePart] = _expiry.split("-");
              const [day, month, year] = datePart.split("/").map(Number);
              const [hours, minutes] = timePart.split(":").map(Number);
              const targetDate = new Date(year, month - 1, day, hours, minutes);
              const now = new Date();
              if (now >= targetDate) {
                setExpiryError("Should be a future time");
                return;
              }
            }

            let _fields = [...fields];
            for (let i = 0; i < _fields.length; i++) {
              _fields[i].name = _fields[i].name.trim();
              if (_fields[i].name.length < 3) {
                setFields((prevData: any[]) => {
                  return [
                    ...prevData.slice(0, i),
                    {
                      name: prevData[i].name,
                      id: prevData[i].id,
                      errorText: "Length should be atleast 3",
                    },
                    ...prevData.slice(i + 1),
                  ];
                });
                return;
              }
            }

            save(
              _title,
              _description,
              amountType,
              _amount,
              quantityFieldName,
              fields,
              id,
              isActive,
              _expiry,
              feeCollectedFrom
            );
          }}
        >
          Save
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: "red",
    // marginTop: 8,
  },
});

export default form;
