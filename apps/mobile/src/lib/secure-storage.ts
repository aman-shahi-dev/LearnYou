import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Supabase session storage backed by the device keychain/keystore.
 * SecureStore values are capped (~2 KB), and Supabase sessions can exceed that,
 * so values are split into chunks.
 */
const CHUNK = 1800;
const countKey = (k: string) => `${k}.n`;
const chunkKey = (k: string, i: number) => `${k}.${i}`;
const safe = (k: string) => k.replace(/[^A-Za-z0-9._-]/g, "_");

async function removeChunks(key: string) {
  const n = Number((await SecureStore.getItemAsync(countKey(key))) ?? 0);
  await Promise.all(Array.from({ length: n }, (_, i) => SecureStore.deleteItemAsync(chunkKey(key, i))));
  await SecureStore.deleteItemAsync(countKey(key));
}

const native = {
  async getItem(rawKey: string) {
    const key = safe(rawKey);
    const n = Number((await SecureStore.getItemAsync(countKey(key))) ?? 0);
    if (!n) return null;
    const parts = await Promise.all(Array.from({ length: n }, (_, i) => SecureStore.getItemAsync(chunkKey(key, i))));
    return parts.some((p) => p === null) ? null : parts.join("");
  },
  async setItem(rawKey: string, value: string) {
    const key = safe(rawKey);
    await removeChunks(key);
    const parts = value.match(new RegExp(`[\\s\\S]{1,${CHUNK}}`, "g")) ?? [""];
    await Promise.all(parts.map((p, i) => SecureStore.setItemAsync(chunkKey(key, i), p)));
    await SecureStore.setItemAsync(countKey(key), String(parts.length));
  },
  async removeItem(rawKey: string) {
    await removeChunks(safe(rawKey));
  },
};

const web = {
  getItem: async (k: string) => (typeof localStorage === "undefined" ? null : localStorage.getItem(k)),
  setItem: async (k: string, v: string) => localStorage.setItem(k, v),
  removeItem: async (k: string) => localStorage.removeItem(k),
};

export const secureStorage = Platform.OS === "web" ? web : native;
