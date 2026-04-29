import { hmac } from "@noble/hashes/hmac.js";
import { sha512 } from "@noble/hashes/sha2.js";
import * as bs58 from "bs58";

export function getMasterKeyFromSeed(seed: Uint8Array): {
  key: Uint8Array;
  chainCode: Uint8Array;
} {
  const key = new TextEncoder().encode("ed25519 seed");

  const I: Uint8Array = hmac(sha512, key, seed); // 64 bytes

  const IL: Uint8Array = I.slice(0, 32); // Master secret key
  const IR: Uint8Array = I.slice(32); // Master chain code

  return { key: IL, chainCode: IR };
}
