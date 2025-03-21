import { View, Text, FlatList } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { post } from "../../../utils/apiService";
import { ActivityIndicator, RadioButton } from "react-native-paper";
import { useFocusEffect } from "expo-router";

enum FilterEnum {
  ALL = "ALL",
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
}

const TransactionStatusMap: any = {
  created: { value: "Pending", color: "blue" },
  authorized: { value: "Pending", color: "blue" },
  captured: { value: "Success", color: "green" },
  refunded: { value: "Refunded", color: "yellow" },
  failed: { value: "Failed", color: "red" },
};

const formatDate = (timestamp: number) => {
  // Convert the Unix timestamp to milliseconds
  const dateObj = new Date(timestamp * 1000);

  const istDateObj = new Date(dateObj.getTime());

  // Format the date
  const readableDate = istDateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short", // Short form of the month
    day: "numeric",
  });

  // Format the time
  const readableTime = istDateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${readableTime}, ${readableDate}`;
};

const transaction = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState(FilterEnum.ALL);
  const [refresh, setRefresh] = useState(0);
  const [
    onEndReachedCalledDuringMomentum,
    setOnEndReachedCalledDuringMomentum,
  ] = useState(true);

  const getTransactions = async (page: number = 1) => {
    if (loading || !hasMore) return;

    const response: any = await post("payment/getTransactions", {
      page,
      filter,
    });

    const newData = response.data;

    setTransactions((prevData) => [...prevData, ...newData]);
    setPage(page);
    setHasMore(newData.length > 0);
  };

  // navigation.setOptions({
  //   title: screenTitle,
  // });

  // useEffect(() => {
  //   getTransactions();
  // }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      getTransactions();
      return () => {
        setTransactions([]);
        setPage(1);
        setLoading(false);
        setHasMore(true);
      };
    }, [refresh])
  );

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          paddingLeft: 10,
          paddingRight: 10,
          paddingTop: 10,
          paddingBottom: 10,
          marginBottom: 1,
          borderRadius: 10,
          backgroundColor: "white",
        }}
      >
        <Text style={{ fontWeight: "bold" }}>₹{item.amount}</Text>
        <View style={{ flex: 1 }}></View>
        <Text style={{ color: TransactionStatusMap[item.status].color }}>
          {TransactionStatusMap[item.status].value}
        </Text>
        <View style={{ flex: 1 }}></View>
        <Text style={{}}>{formatDate(item.created_at)}</Text>
      </View>
    );
  };

  const handleLoadMore = () => {
    if (!loading && hasMore && !onEndReachedCalledDuringMomentum) {
      getTransactions(page + 1);
      setOnEndReachedCalledDuringMomentum(true);
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
      <RadioButton.Group
        onValueChange={(data: any) => {
          if (data != filter) {
            setFilter(data);
            setTransactions([]);
            setPage(1);
            setLoading(false);
            setHasMore(true);
            setRefresh(refresh + 1);
          }
        }}
        value={filter}
      >
        <View style={{ flexDirection: "row" }}>
          <RadioButton.Item
            labelStyle={{ fontWeight: "bold" }}
            label="All"
            value={FilterEnum.ALL}
          />
          <RadioButton.Item
            labelStyle={{ fontWeight: "bold", color: "green" }}
            label="Credit"
            value={FilterEnum.CREDIT}
          />
          <RadioButton.Item
            labelStyle={{ fontWeight: "bold", color: "darkred" }}
            label="Debit"
            value={FilterEnum.DEBIT}
          />
        </View>
      </RadioButton.Group>
    </View>
  );

  return (
    <View style={{ marginTop: 20, paddingBottom: 60 }}>
      {/* <HeaderComponent /> */}
      <FlatList
        // ListHeaderComponent={HeaderComponent}
        style={{ paddingLeft: 20, paddingRight: 20 }}
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        onMomentumScrollBegin={() => {
          setOnEndReachedCalledDuringMomentum(false);
        }}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

export default transaction;
