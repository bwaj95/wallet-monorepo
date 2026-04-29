// import { Keypair } from "@solana/web3.js";
// import { derivePath } from "ed25519-hd-key";
import * as ed25519 from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha2.js";
import { toHex } from "../../utils";
import nacl from "tweetnacl";
import { type SignKeyPair } from "tweetnacl";
import bs58 from "bs58";
import { hmac } from "@noble/hashes/hmac.js";
import { parseDerivationPath } from "../../utils/derivationPath";

const SOLANA_DERIVATION_PATH_PATTERN = "m/44'/501'/x'/0'";
export const deriveSolanaAccount = (seed: Uint8Array, accountIndex: number) => {
  const path = SOLANA_DERIVATION_PATH_PATTERN.replace(
    "x",
    accountIndex.toString(),
  );

  const keypair: SignKeyPair = deriveSolanaKeypair(seed, path);

  return {
    publicKey: bs58.encode(keypair.publicKey),
    secretKey: keypair.secretKey,
  };
};

export const deriveSolanaAccountFromSeed = (seed: Uint8Array) => {
  ed25519.hashes.sha512 = sha512;
  const privateKey = seed.slice(0, 32);
  const publicKey = ed25519.getPublicKey(privateKey);

  return {
    publicKey: toHex(publicKey),
    secretKey: privateKey,
  };
};

export function deriveSolanaPrivateKey(
  seed: Uint8Array,
  derivationPath: string,
): Uint8Array {
  const privateKey: Uint8Array = derivePath(derivationPath, seed).key;

  return privateKey;
}

export const deriveSolanaPublicKey = (privateKey: Uint8Array): Uint8Array => {
  ed25519.hashes.sha512 = sha512;
  const publicKey = ed25519.getPublicKey(privateKey);
  return publicKey;
};

export function deriveSolanaKeypair(
  seed: Uint8Array,
  derivationPath: string,
): SignKeyPair {
  const secretKey: Uint8Array = deriveSolanaPrivateKey(seed, derivationPath);

  const keypair: SignKeyPair = nacl.sign.keyPair.fromSeed(secretKey);

  return keypair;
}

export function getMasterKeyFromSeed(seed: Uint8Array): {
  key: Uint8Array;
  chainCode: Uint8Array;
} {
  const key = new TextEncoder().encode("ed25519 seed");

  const I = hmac(sha512, key, seed);

  const IL = I.slice(0, 32);
  const IR = I.slice(32);

  return { key: IL, chainCode: IR };
}

function toBigEndianBytes(index: number): Uint8Array {
  const bytes = new Uint8Array(4);

  bytes[0] = (index >> 24) & 0xff;
  bytes[1] = (index >> 16) & 0xff;
  bytes[2] = (index >> 8) & 0xff;
  bytes[3] = index & 0xff;

  return bytes;
}

function deriveChildKey(
  parentKey: Uint8Array,
  parentChaincode: Uint8Array,
  index: number,
) {
  const data = new Uint8Array(1 + 32 + 4);

  data[0] = 0x00; // 0 for hardened
  data.set(parentKey, 1); // parent key
  data.set(toBigEndianBytes(index), 33); // index in big-endian for entropy

  const I = hmac(sha512, parentChaincode, data);
  const IL = I.slice(0, 32);
  const IR = I.slice(32);

  return { key: IL, chaincode: IR };
}

export function derivePath(
  path: string,
  seed: Uint8Array,
): { key: Uint8Array; chainCode: Uint8Array } {
  const { key: masterKey, chainCode: masterChainCode } =
    getMasterKeyFromSeed(seed);

  const pathIndexes = parseDerivationPath(path);

  let currentKey = masterKey;
  let currentChainCode = masterChainCode;

  for (const index of pathIndexes) {
    const derived = deriveChildKey(currentKey, currentChainCode, index);
    currentKey = derived.key;
    currentChainCode = derived.chaincode;
  }

  return { key: currentKey, chainCode: currentChainCode };
}
