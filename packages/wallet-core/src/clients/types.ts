export type Message =
  | { type: "CREATE_HD_WALLET" }
  | { type: "IMPORT_HD_WALLET"; mnemonic: string }
  | { type: "ADD_HD_ACCOUNT"; walletId: string }
  | { type: "GET_WALLET" }
  | { type: "GET_WALLET_INIT_STATE" }
  | { type: "SET_WALLET_PASSWORD"; password: string }
  | { type: "CLEAR_WALLET" }
  | { type: "UNLOCK_WALLET"; password: string }
  | { type: "GET_BALANCE"; address: string };

export type Response =
  | { success: true; data: any }
  | { success: false; error: string };
