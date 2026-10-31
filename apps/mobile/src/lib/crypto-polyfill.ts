import { requireOptionalNativeModule } from "expo";

/**
 * Minimal WebCrypto for React Native so supabase-js can use S256 PKCE
 * (instead of falling back to the weaker "plain" code challenge).
 * Must be imported before the Supabase client is created.
 *
 * expo-crypto is loaded only when its native module exists: some Expo Go builds
 * don't ship it, and importing it there crashes at startup. Dev/production builds
 * always include it, so they always get S256.
 */
const g = globalThis as { crypto?: { getRandomValues?: Crypto["getRandomValues"]; subtle?: SubtleCrypto } };

if (requireOptionalNativeModule("ExpoCrypto")) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { CryptoDigestAlgorithm, digest, getRandomValues } = require("expo-crypto") as typeof import("expo-crypto");

  g.crypto ??= {};
  g.crypto.getRandomValues ??= getRandomValues as Crypto["getRandomValues"];
  if (!g.crypto.subtle) {
    g.crypto.subtle = {
      digest: (algorithm: AlgorithmIdentifier, data: BufferSource) => {
        const name = typeof algorithm === "string" ? algorithm : algorithm.name;
        if (name.toUpperCase() !== "SHA-256") throw new Error(`Unsupported digest: ${name}`);
        return digest(CryptoDigestAlgorithm.SHA256, data);
      },
    } as SubtleCrypto;
  }
} else if (__DEV__) {
  console.log("[crypto] ExpoCrypto native module unavailable (Expo Go) — PKCE uses plain challenge in this session");
}
