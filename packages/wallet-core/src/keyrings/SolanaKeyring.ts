import nacl, { type SignKeyPair } from "tweetnacl";
import bs from "bs58";
import { mnemonicToSeed, validateMnemonic } from "../core/mnemonic";
import { derivePath } from "../blockchains/solana/derive";
import { KEYRING_TYPES, type KeyringType } from "./types";

const SOLANA_DERIVATION_PATH_PATTERN = "m/44'/501'/x'/0'";

export interface KeyringBase {
  __type: KeyringType;
  publicKeys(): Array<string>;
  deletePublicKey(publicKey: string): void;
  //   signTransaction(tx: Buffer, address: string): Promise<string>;
  //   exportSecretKey(address: string): string | null;
  //   importSecretKey(secretKey: string, publicKey: string): string;
}

class SolanaKeyringBase implements KeyringBase {
  __type: KeyringType = KEYRING_TYPES.BASE;
  protected uuid: string;
  protected readonly seed: Uint8Array;
  protected keypairs: SignKeyPair[];

  constructor(seed: Uint8Array) {
    this.uuid = crypto.randomUUID();
    this.seed = seed;
    this.keypairs = [];
  }

  publicKeys(): Array<string> {
    return this.keypairs.map((kp) => bs.encode(kp.publicKey));
  }

  deletePublicKey(publicKey: string): void {
    this.keypairs = this.keypairs.filter(
      (kp) => bs.encode(kp.publicKey) !== publicKey,
    );
  }

  getKeyringUuid(): string {
    return this.uuid;
  }
}

export type HdKeyringJson = {
  mnemonic: string;
  seed: string;
  derivationPaths: Array<string>;
  accountIndex?: number;
  walletIndex?: number;
};

export interface HdKeyring extends KeyringBase {
  readonly mnemonic: string;
  checkMnemonic(m: string): boolean;
  //   addDerivationPath(derivationPath: string, publicKey: string): string;
  toJson(): HdKeyringJson;
}

export class SolanaHdKeyring extends SolanaKeyringBase implements HdKeyring {
  __type: KeyringType = KEYRING_TYPES.HD;
  readonly mnemonic: string;
  // private readonly masterKey: Uint8Array;
  // private readonly chainCode: Uint8Array;
  private derivationPaths: Array<string>;
  private accountIndex?: number;
  // private walletIndex?: number;

  constructor(mnemonic: string) {
    if (!mnemonic || !validateMnemonic(mnemonic)) {
      throw new Error("Invalid mnemonic");
    }

    // mnemonic to seed
    super(mnemonicToSeed(mnemonic));
    this.mnemonic = mnemonic;

    // seed to master key and chain code
    // const { key: masterKey, chainCode } = getMasterKeyFromSeed(this.seed);
    // this.masterKey = masterKey;
    // this.chainCode = chainCode;

    this.derivationPaths = [];
    this.accountIndex = 0;
  }

  deletePublicKey(publicKey: string): void {
    const index = this.keypairs.findIndex(
      (kp) => bs.encode(kp.publicKey) === publicKey,
    );

    if (index < 0) return;

    this.derivationPaths.splice(index, 1);
    super.deletePublicKey(publicKey);
  }

  toJson(): HdKeyringJson {
    return {
      mnemonic: this.mnemonic,
      seed: bs.encode(this.seed),
      derivationPaths: this.derivationPaths,
    };
  }

  deriveNextKeypair(): { index: number; address: string } {
    const index = this.accountIndex || 0;
    const path = SOLANA_DERIVATION_PATH_PATTERN.replace("x", index.toString());

    const derived = derivePath(path, this.seed).key;

    const keypair: SignKeyPair = nacl.sign.keyPair.fromSeed(derived);

    this.keypairs.push(keypair);
    this.derivationPaths.push(path);
    this.accountIndex = this.accountIndex ? this.accountIndex + 1 : 1;

    return {
      index,
      address: bs.encode(keypair.publicKey),
    };
  }

  checkMnemonic(m: string): boolean {
    if (!validateMnemonic(m)) {
      return false;
    }

    if (this.mnemonic.split(" ").length !== m.split(" ").length) {
      return false;
    } else {
      return true;
    }
  }
}
