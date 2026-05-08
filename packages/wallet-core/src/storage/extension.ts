import { decryptData, encryptData } from "../core/crypto";
import { type WalletInitializationState, type WalletState } from "./types";

const STORAGE_KEY = "wallet_state";
const WALLET_INITIALIZATION_STATE_KEY = "wallet_initialization_state";

declare const chrome: any;

let sessionPassword: string | null = null;

export async function updateWalletState(
  state: Partial<WalletState>,
): Promise<void> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);

    console.log("[updateWalletState] retrieved data: ", result[STORAGE_KEY]);

    let currentState = {} as WalletState;

    if (result[STORAGE_KEY]) {
      const decrypted = await decryptData(
        result[STORAGE_KEY],
        sessionPassword!,
      );

      console.log("[updateWalletState] decrypted data: ", decrypted);

      currentState = JSON.parse(decrypted) as WalletState;
      console.log("[updateWalletState] current state: ", currentState);
    }

    const updatedState = {
      ...currentState,
      ...state,
      lastUpdated: Date.now(),
    };

    if (!sessionPassword) {
      throw new Error(
        "[updateWalletState] Session password is not set. Cannot encrypt wallet state.",
      );
    }

    console.log("[udpateWalletState] updates state");
    console.log(updatedState);

    const encryptedData = await encryptData(
      JSON.stringify(updatedState),
      sessionPassword,
    );

    console.log("[udpateWalletState] encrypted data: ", encryptedData);

    await chrome.storage.local.set({ [STORAGE_KEY]: encryptedData });
  } catch (error) {
    throw new Error("Failed to save state to storage: " + error);
  }
}

export async function unlockWallet(
  password: string,
): Promise<WalletState | null> {
  try {
    sessionPassword = password;
    console.log("session password set in unlockWallet");
    const walletState = await getWalletState();

    return walletState;
  } catch (error) {
    throw new Error("Failed to unlock wallet: " + error);
  }
}

export async function getWalletState(): Promise<WalletState | null> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const encryptedData = result[STORAGE_KEY];

    if (!encryptedData) {
      return null;
    }

    if (!sessionPassword) {
      throw new Error(
        "[getWalletState] Session password is not set. Cannot decrypt wallet state.",
      );
    }

    console.log("[getWalletState] encryptedData: ", encryptedData);

    const decryptedData = await decryptData(encryptedData, sessionPassword);

    console.log("[getWalletState] decryptedData: ", decryptedData);

    const walletState = JSON.parse(decryptedData) as WalletState;
    console.log("[getWalletState] walletState: ", walletState);

    return walletState;
  } catch (error) {
    throw new Error(
      "[getWalletState] Failed to retrieve state from storage: " + error,
    );
  }
}

export async function initWalletState() {
  try {
    const currentState = await getWalletInitializationState();

    if (!currentState) {
      await clearWalletState();
      return;
    }

    const walletStorage = await chrome.storage.local.get(STORAGE_KEY);
    const encryptedData = walletStorage[STORAGE_KEY];

    if (!encryptedData && currentState === "initialized") {
      await clearWalletState();
      return;
    }
  } catch (error) {
    throw new Error("Failed to initialize wallet state: " + error);
  }
}

export async function clearWalletState() {
  await chrome.storage.local.remove(STORAGE_KEY);
  await chrome.storage.local.set({
    [WALLET_INITIALIZATION_STATE_KEY]: "uninitialized",
  });
}

export async function getWalletInitializationState(): Promise<WalletInitializationState | null> {
  try {
    const result = await chrome.storage.local.get(
      WALLET_INITIALIZATION_STATE_KEY,
    );

    const state = result[
      WALLET_INITIALIZATION_STATE_KEY
    ] as WalletInitializationState;

    console.log("getWalletInitState result: ", result);
    console.log("getWalletInitState: ", state);

    return state;
  } catch (error) {
    return null;
  }
}

export async function initWalletPassword(password: string): Promise<boolean> {
  try {
    const initializationState = await getWalletInitializationState();
    if (initializationState === "initialized") {
      throw new Error("Wallet is already initialized.");
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }

    sessionPassword = password;
    console.log("[initWalletPassword] sessionPassword set: ", sessionPassword);
    await chrome.storage.local.set({
      [WALLET_INITIALIZATION_STATE_KEY]: "initialized",
    });
    return true;
  } catch (error) {
    throw new Error("Failed to initialize wallet password: " + error);
  }
}
