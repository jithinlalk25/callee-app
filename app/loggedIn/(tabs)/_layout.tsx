import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import { Tabs } from "expo-router";

const _layout = () => {
  return (
    <Tabs>
      <Tabs.Screen
        name="form"
        options={{
          title: "Forms",
          headerTitle: "Callee",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={20} name="files-o" color={color} />
          ),
        }}
      />

      {/* <Tabs.Screen
        name="transaction"
        options={{
          title: "Transactions",

          tabBarIcon: ({ color }) => (
            <FontAwesome size={20} name="th-list" color={color} />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",

          tabBarIcon: ({ color }) => (
            <FontAwesome size={20} name="bank" color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
