import { useState } from "react";
import "./index.css";
import { Button } from "@repo/ui";
import { createSolanaWalletInit, createSolanaAccount } from "@repo/wallet-core";

function App() {
  const [accountIndex, setAccountIndex] = useState(0);
  const [mnemonic, setMnemonic] = useState("");
  const [accounts, setAccounts] = useState<
    {
      publicKey: string;
      secretKey: Uint8Array;
    }[]
  >([]);

  const handleWalletCreation = () => {
    if (!mnemonic) {
      const { mnemonic: newMnemonic, account } = createSolanaWalletInit();
      setMnemonic(newMnemonic);
      setAccounts((prev) => [...prev, account]);
    } else {
      const { account } = createSolanaAccount(mnemonic, accountIndex);
      setAccounts((prev) => [...prev, account]);
    }
    setAccountIndex((prev) => prev + 1);
  };

  return (
    <div className={" w-3xl h-96 bg-blue-100 p-4 flex flex-col gap-4"}>
      <Button onClick={handleWalletCreation}>Create Wallet</Button>

      <div className="flex flex-col gap-4">
        {mnemonic && (
          <div className="text-center ">
            <p className="mb-2">Mnemonic:</p>
            <p className="text-lg font-bold">{mnemonic}</p>
          </div>
        )}

        {accounts.length > 0 &&
          accounts.map((account, index) => (
            <div key={index} className="flex flex-col gap-4">
              <p className="mb-2 mt-4">Public Key:</p>
              <p className="text-lg font-bold">{account.publicKey}</p>

              <p className="mb-2 mt-4">Secret Key:</p>
              <p className="text-lg font-bold">
                {Array.from(account?.secretKey || []).join(", ")}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}

export default App;
