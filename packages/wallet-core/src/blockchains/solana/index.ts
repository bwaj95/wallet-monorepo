import { generateMnemonic, mnemonicToSeed } from "../../core/mnemonic";
import { deriveSolanaAccount } from "./derive";

export const createSolanaWalletInit = (mnemonicLength: number = 12) => {
  const mnemonic = generateMnemonic(mnemonicLength === 12 ? 128 : 256);

  const seed: Uint8Array = mnemonicToSeed(mnemonic);

  const account = deriveSolanaAccount(seed, 0);

  return {
    mnemonic,
    account,
  };
};

export const createSolanaAccount = (mnemonic: string, accountIndex: number) => {
  const seed: Uint8Array = mnemonicToSeed(mnemonic);

  const account = deriveSolanaAccount(seed, accountIndex);

  return {
    index: accountIndex,
    account,
  };
};
