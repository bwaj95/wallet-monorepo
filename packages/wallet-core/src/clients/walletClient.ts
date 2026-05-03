import { type Message, type Response } from "./types";

declare const chrome: any;
async function sendMessage<T = any>(message: Message): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response: Response) => {
      // 1. Check for extension context invalidated or no listener
      if (chrome.runtime.lastError) {
        return reject(new Error(chrome.runtime.lastError.message));
      }

      if (!response) {
        return reject(new Error("No response from background"));
      }

      if (response.success) {
        resolve(response.data);
      } else {
        reject(new Error(response.error));
      }
    });
  });
}

export const walletClient = {
  // TODO: Extend support for operations as per blockchain type.
  async createHdWallet() {
    return sendMessage<{
      mnemonic: string;
      walletId: string;
      accounts: string[];
    }>({
      type: "CREATE_HD_WALLET",
    });
  },

  async importHdWallet(mnemonic: string) {
    return sendMessage<{
      mnemonic: string;
      walletId: string;
      accounts: string[];
    }>({
      type: "IMPORT_HD_WALLET",
      mnemonic,
    });
  },

  async addHdAccount(walletId: string) {
    return sendMessage<{ walletId: string; index: number; address: string }>({
      type: "ADD_HD_ACCOUNT",
      walletId,
    });
  },
};
