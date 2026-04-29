import * as bip39 from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";

export function generateMnemonic(strength: number = 128): string {
  // mnemonic default length is 12 words => 128 bits of entropy. Else 24 words => 256 bits of entropy
  // Skip other options.
  return bip39.generateMnemonic(wordlist, strength);
}

export function validateMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic, wordlist);
}

export function mnemonicToSeed(
  mnemonic: string,
  password: string | undefined = undefined,
): Uint8Array {
  const isValid = validateMnemonic(mnemonic);
  if (!isValid) {
    throw new Error("Invalid mnemonic");
  }

  return Uint8Array.from(bip39.mnemonicToSeedSync(mnemonic, password));
}
