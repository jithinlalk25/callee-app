import { View, Text, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { post } from "../../../utils/apiService";
import { ActivityIndicator, Button } from "react-native-paper";
import { AmountTypeEnum } from "../form/[id]";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import XLSX from "xlsx";
import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";

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

const submission = () => {
  const navigation = useNavigation();

  const { formId }: { formId: string } = useLocalSearchParams();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [form, setForm] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const init = async () => {
    const response: any = await post("form/getForm", {
      formId,
    });
    setForm(response.data);
  };

  const getSubmissions = async (page: number = 1) => {
    if (loading || !hasMore) return;

    const response: any = await post("submission/getSubmissions", {
      formId,
      page,
    });

    const newData = response.data;

    setSubmissions((prevData) => [...prevData, ...newData]);
    setPage(page);
    setHasMore(newData.length > 0);
  };

  useEffect(() => {
    navigation.setOptions({
      title: "Submissions",
      headerRight: () => (
        <Button
          style={{
            width: "auto",
          }}
          mode="text"
          icon="export"
          onPress={() => {
            exportDataToExcel(formId);
          }}
        >
          Export
        </Button>
      ),
    });

    init();
    getSubmissions();
  }, []);

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View
        style={{
          padding: 10,
          marginBottom: 2,
          borderRadius: 10,
          backgroundColor: "white",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            marginBottom: 5,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>₹{item.amountForUser}</Text>
          <View style={{ flex: 1 }}></View>
          <Text style={{}}>{formatDate(item.createdAt)}</Text>
        </View>
        {form.fields.map((field: any) => (
          <View key={field.id} style={{ flexDirection: "row" }}>
            <Text style={{ fontWeight: "bold", color: "darkblue" }}>
              {field.name}:
            </Text>
            <Text> {item.data.fields[field.id]}</Text>
          </View>
        ))}
        {form.amountType == AmountTypeEnum.QUANTITY && (
          <View style={{ flexDirection: "row" }}>
            <Text style={{ fontWeight: "bold", color: "darkblue" }}>
              {form.quantityField.name}:
            </Text>
            <Text> {item.data.quantity}</Text>
          </View>
        )}
      </View>
    );
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      getSubmissions(page + 1);
    }
  };

  const renderFooter = () => {
    return loading ? (
      <ActivityIndicator
        style={{
          marginVertical: 100,
        }}
      />
    ) : null;
  };

  const HeaderComponent = () => (
    <View style={{ marginBottom: 10, marginLeft: 20, marginRight: 20 }}>
      <Text style={{ fontWeight: "bold", fontSize: 20 }}>{form.title}</Text>
      <View style={{ flexDirection: "row", marginTop: 5, marginBottom: 5 }}>
        <Text style={{ fontWeight: "bold", fontSize: 18, color: "darkgreen" }}>
          {form.submissionCount}{" "}
          {form.submissionCount > 1 ? "Submissions" : "Submission"}
        </Text>
        <View style={{ flex: 1 }}></View>
        <Text style={{ fontWeight: "bold", fontSize: 18, color: "darkgreen" }}>
          ₹{form.amountCollected} Collected
        </Text>
      </View>
    </View>
  );

  return (
    form && (
      <View style={{ marginTop: 20 }}>
        <HeaderComponent />
        <FlatList
          // ListHeaderComponent={HeaderComponent}
          style={{ paddingLeft: 20, paddingRight: 20 }}
          data={submissions}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      </View>
    )
  );
};

export default submission;

const exportDataToExcel = async (formId: string) => {
  const response: any = await post("form/getForm", {
    formId,
  });
  const form = response.data;

  const response1: any = await post("submission/getSubmissions", {
    formId,
    page: 1,
    all: true,
  });
  const submissions = response1.data;

  let headers = form.fields.map((x: any) => x.name);
  if (form.amountType == AmountTypeEnum.QUANTITY) {
    headers.push(form.quantityField.name);
  }
  headers.push("Amount");
  headers.push("Date & Time");

  const customLines = [
    [],
    [form.title], // Title Row
    [],
    [
      `${form.submissionCount} ${
        form.submissionCount > 1 ? "Submissions" : "Submission"
      }, ₹${form.amountCollected} Collected`,
    ], // Additional metadata row
    [],
    headers,
  ];

  let data: any = [];

  submissions.forEach((sub: any) => {
    let tempData = [];

    form.fields.forEach((x: any) => {
      tempData.push(sub.data.fields[x.id]);
    });

    if (form.amountType == AmountTypeEnum.QUANTITY) {
      tempData.push(sub.quantity);
    }
    tempData.push(sub.amountForUser);
    tempData.push(formatDate(sub.updatedAt));
    data.push(tempData);
  });

  const ws = XLSX.utils.aoa_to_sheet([]); // Start with an empty sheet

  // Step 3: Add custom lines to the worksheet
  XLSX.utils.sheet_add_aoa(ws, customLines, { origin: 0 }); // Add custom lines at the top (row 0)

  XLSX.utils.sheet_add_aoa(ws, data, { origin: customLines.length });

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }, // Merge A1 to C1 (0-based index)
    { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: headers.length - 1 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: headers.length - 1 } },
    { s: { r: 4, c: 0 }, e: { r: 4, c: headers.length - 1 } },
  ];

  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Append the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  // Write the Excel file to a binary string
  const wbout = XLSX.write(wb, { type: "binary", bookType: "xlsx" });

  // Convert the binary string to a buffer (Node.js `Buffer` works well for this)
  const buffer = Buffer.from(wbout, "binary");

  // Convert the buffer to base64 string
  const base64Data = buffer.toString("base64");

  // Define the file path
  const path = `${FileSystem.documentDirectory}callee_data_export.xlsx`;

  try {
    // Save the file
    await FileSystem.writeAsStringAsync(path, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });
    // Alert.alert("Exported successfully", `File saved to ${path}`);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(path); // Share the exported file
    } else {
      Alert.alert("Sharing not available");
    }
  } catch (error) {
    Alert.alert("Error", "Failed to export data");
    console.error(error);
  }
};
