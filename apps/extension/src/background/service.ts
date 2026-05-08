import {
  clearWalletState,
  generateMnemonic,
  getWalletInitializationState,
  // getWalletState,
  initWalletPassword,
  initWalletState,
  keyringStore,
  unlockWallet,
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

        console.log("Mnemonic generated.");
        const { walletId, accounts } = keyringStore.createHdWallet(mnemonic);
        console.log("wallet generated. fetching wallet state...");

        const walletState: WalletState = keyringStore.getWalletState();
        console.log("wallet state fetched: ", walletState);

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

      case "CLEAR_WALLET": {
        await clearWalletState();

        break;
      }

      case "UNLOCK_WALLET": {
        const walletState: WalletState | null = await unlockWallet(
          message.password,
        );

        let wallet = null;

        if (walletState) {
          keyringStore.setState(walletState);
          wallet = keyringStore.getWallet();
        }

        sendResponse({
          success: true,
          data: wallet,
        });
        break;
      }

      case "GET_WALLET_INIT_STATE": {
        const initState = await getWalletInitializationState();

        sendResponse({
          success: true,
          data: initState,
        });
        break;
      }

      case "SET_WALLET_PASSWORD": {
        const { password } = message;

        const success = await initWalletPassword(password);

        sendResponse({
          success: true,
          data: success,
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

// async function initStorage() {
//   const walletState: WalletState | null = await getWalletState();

//   if (walletState) {
//     keyringStore.setState(walletState);
//   }
// }

async function initWallet() {
  await initWalletState();
}

async function init() {
  try {
    initEventListeners();
    await initWallet();
    // await initStorage();
    console.log("Background service initialized");
  } catch (error) {
    console.error("Failed to initialize background service:", error);
  }
}

init().catch((err) => {
  console.error("Failed to initialize background service:", err);
});
