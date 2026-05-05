import { type WalletState } from "./types";

const STORAGE_KEY = "wallet_state";

declare const chrome: any;

export async function updateWalletState(
  state: Partial<WalletState>,
): Promise<void> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const currentState = (result[STORAGE_KEY] as WalletState) || {};

    const updatedState = {
      ...currentState,
      ...state,
      lastUpdated: Date.now(),
    };

    await chrome.storage.local.set({ [STORAGE_KEY]: updatedState });
  } catch (error) {
    throw new Error("Failed to save state to storage: " + error);
  }
}

export async function getWalletState(): Promise<WalletState | null> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return (result[STORAGE_KEY] as WalletState) || null;
  } catch (error) {
    throw new Error("Failed to retrieve state from storage: " + error);
  }
}
