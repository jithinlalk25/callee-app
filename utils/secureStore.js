import * as SecureStore from "expo-secure-store";

export async function setSecureStoreData(key, value) {
  await SecureStore.setItemAsync(key, value);
}

export async function getSecureStoreData(key) {
  return await SecureStore.getItemAsync(key);
}

export async function deleteSecureStoreData(key) {
  return await SecureStore.deleteItemAsync(key);
}
