import {
  generateMnemonic,
  keyringStore,
  type Message,
  type Response,
} from "@repo/wallet-core";

declare const chrome: any;

chrome.runtime.onMessage.addListener(
  (
    message: Message,
    _sender: any,
    sendResponse: (response: Response) => void,
  ) => {
    handleMessage(message, sendResponse);

    return true; // required for async response
  },
);

async function handleMessage(
  message: Message,
  sendResponse: (response: Response) => void,
) {
  try {
    switch (message.type) {
      case "CREATE_HD_WALLET": {
        const mnemonic = generateMnemonic();

        const { walletId, accounts } = keyringStore.createHdWallet(mnemonic);

        sendResponse({
          success: true,
          data: { mnemonic, walletId, accounts },
        });
        break;
      }

      case "IMPORT_HD_WALLET": {
        const { mnemonic, walletId, accounts } = keyringStore.importHdWallet(
          message.mnemonic,
        );

        sendResponse({
          success: true,
          data: { mnemonic, walletId, accounts },
        });
        break;
      }

      case "ADD_HD_ACCOUNT": {
        const { walletId, index, address } = keyringStore.addHdAccount(
          message.walletId,
        );

        sendResponse({
          success: true,
          data: { walletId, index, address },
        });

        break;
      }

      default:
        sendResponse({
          success: false,
          error: "Unknown message type",
        });
    }
  } catch (err: any) {
    sendResponse({
      success: false,
      error: err.message || "An unknown error occurred",
    });
  }
}
