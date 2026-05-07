import { type HdKeyringJson } from "../keyrings/SolanaKeyring";

export type NetworkType = "mainnet" | "testnet" | "devnet";
export type BlockchainType = "solana";

export interface WalletState {
  keyrings: HdKeyringJson[];
  activeKeyringIndex: number;
  activeNetwork?: NetworkType;
  activeBlockchain?: BlockchainType;
  lastUpdated: number;
}

export type WalletInitializationState =
  | "loading"
  | "uninitialized"
  | "initializing"
  | "initialized";
