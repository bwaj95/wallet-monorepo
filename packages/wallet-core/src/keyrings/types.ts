export const KEYRING_TYPES = {
  BASE: "base",
  HD: "hd",
} as const;

// This automatically creates the union type "base" | "hd" | ...
export type KeyringType = (typeof KEYRING_TYPES)[keyof typeof KEYRING_TYPES];
