import {
  generateMnemonic,
  getWalletState,
  keyringStore,
  updateWalletState,
  type Message,
  type Response,
  type WalletState,
} from "@repo/wallet-core";

declare const chrome: any;

function initEventListeners() {
  // Initialize storage or any other necessary setup here

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
}

async function handleMessage(
  message: Message,
  sendResponse: (response: Response) => void,
) {
  try {
    switch (message.type) {
      case "CREATE_HD_WALLET": {
        const mnemonic = generateMnemonic();

        const { walletId, accounts } = keyringStore.createHdWallet(mnemonic);

        const walletState: WalletState = keyringStore.getWalletState();
        await updateWalletState(walletState);

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

        const walletState: WalletState = keyringStore.getWalletState();
        await updateWalletState(walletState);

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

        const walletState: WalletState = keyringStore.getWalletState();
        await updateWalletState(walletState);

        sendResponse({
          success: true,
          data: { walletId, index, address },
        });

        break;
      }

      case "GET_WALLET": {
        const wallet = keyringStore.getWallet();

        sendResponse({
          success: true,
          data: wallet,
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

async function initStorage() {
  const walletState: WalletState | null = await getWalletState();

  if (walletState) {
    keyringStore.setState(walletState);
  }
}

async function init() {
  initEventListeners();
  await initStorage();
}

init().catch((err) => {
  console.error("Failed to initialize background service:", err);
});
