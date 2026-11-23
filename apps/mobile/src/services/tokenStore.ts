import * as SecureStore from 'expo-secure-store';

const ACCESS = 'be_access';
const REFRESH = 'be_refresh';

export async function saveTokens(access: string, refresh: string) {
  await SecureStore.setItemAsync(ACCESS, access);
  await SecureStore.setItemAsync(REFRESH, refresh);
}

export async function getAccess() {
  return SecureStore.getItemAsync(ACCESS);
}

export async function getRefresh() {
  return SecureStore.getItemAsync(REFRESH);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS);
  await SecureStore.deleteItemAsync(REFRESH);
}
