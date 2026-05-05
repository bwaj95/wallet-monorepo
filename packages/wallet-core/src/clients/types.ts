export type Message =
  | { type: "CREATE_HD_WALLET" }
  | { type: "IMPORT_HD_WALLET"; mnemonic: string }
  | { type: "ADD_HD_ACCOUNT"; walletId: string }
  | { type: "GET_WALLET" };

export type Response =
  | { success: true; data: any }
  | { success: false; error: string };
