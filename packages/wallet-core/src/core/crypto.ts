import { base64ToBytes, bytesToBase64 } from "../utils/base64";

export async function deriveKey(password: string, salt: Uint8Array) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  const key = crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt.buffer as BufferSource,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );

  return key;
}

export async function encryptData(
  data: string,
  password: string,
): Promise<{
  cipherText: string;
  salt: string;
  iv: string;
}> {
  const enc = new TextEncoder();

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(password, salt);

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv.buffer as BufferSource },
    key,
    enc.encode(data).buffer as BufferSource,
  );

  return {
    cipherText: bytesToBase64(new Uint8Array(cipherBuffer)),
    salt: bytesToBase64(new Uint8Array(salt)),
    iv: bytesToBase64(new Uint8Array(iv)),
  };
}

export async function decryptData(
  payload: { cipherText: string; salt: string; iv: string },
  password: string,
): Promise<string> {
  const dec = new TextDecoder();

  const cipherText = base64ToBytes(payload.cipherText);
  const salt = base64ToBytes(payload.salt);
  const iv = base64ToBytes(payload.iv);

  const key = await deriveKey(password, salt);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv.buffer as BufferSource },
    key,
    cipherText.buffer as BufferSource,
  );

  const data = dec.decode(decryptedBuffer);

  return data;
}
