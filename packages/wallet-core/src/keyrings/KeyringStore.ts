import {
  type HdKeyring,
  type KeyringBase,
  SolanaHdKeyring,
} from "./SolanaKeyring";
import { KEYRING_TYPES } from "./types";

class KeyringStore {
  private keyrings: KeyringBase[] = [];
  private activeKeyringIndex: number = -1;

  createHdWallet(mnemonic: string): {
    mnemonic: string;
    walletId: string;
    accounts: string[];
  } {
    const keyring: HdKeyring = new SolanaHdKeyring(mnemonic);
    this.keyrings.push(keyring);
    if (this.activeKeyringIndex === -1) this.activeKeyringIndex = 0;

    const uuid = (keyring as SolanaHdKeyring).getKeyringUuid();
    const { address } = this.addHdAccount(uuid);

    return {
      mnemonic,
      walletId: uuid,
      accounts: [address],
    };
  }

  importHdWallet(mnemonic: string): {
    mnemonic: string;
    walletId: string;
    accounts: string[];
  } {
    const exists = this.keyrings.some(
      (kr) =>
        kr.__type === KEYRING_TYPES.HD &&
        (kr as HdKeyring).checkMnemonic(mnemonic),
    );

    if (exists) {
      throw new Error("Wallet with given Mnemonic exists already.");
    }

    return this.createHdWallet(mnemonic);
  }

  setActiveWallet(index: number) {
    if (
      this.keyrings.length > 0 &&
      index >= 0 &&
      index < this.keyrings.length
    ) {
      this.activeKeyringIndex = index;
    }
  }

  isInitialized() {
    return this.keyrings.length === 0;
  }

  //   private getActiveKeyring(): KeyringBase | undefined {
  //     if (!this.isInitialized()) {
  //       throw new Error("Wallet not initialized.");
  //     }

  //     return this.keyrings[this.activeKeyringIndex];
  //   }

  //   private getHdWalletByIndex(index: number): {
  //     uuid: string;
  //     publicKeys: string[];
  //   } {
  //     const kr = this.keyrings[index];
  //     const publicKeys = (kr as SolanaHdKeyring).publicKeys();
  //     const uuid = (kr as SolanaHdKeyring).getKeyringUuid();

  //     return { uuid, publicKeys };
  //   }

  addHdAccount(walletId: string): {
    walletId: string;
    index: number;
    address: string;
  } {
    const wallets = this.keyrings.filter(
      (kr) =>
        kr.__type === "hd" &&
        (kr as SolanaHdKeyring).getKeyringUuid() === walletId,
    );

    if (wallets.length != 1) {
      throw new Error("Wallet doesn't exist.");
    }

    const kr = wallets[0];

    const { index, address } = (kr as SolanaHdKeyring).deriveNextKeypair();

    return {
      walletId,
      index,
      address,
    };
  }
}

export const keyringStore = new KeyringStore();
