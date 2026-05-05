import { useEffect, useState } from "react";
import "./index.css";
import { Button } from "@repo/ui";
// import { createSolanaWalletInit, createSolanaAccount } from "@repo/wallet-core";
import { walletClient } from "@repo/wallet-core";

function App() {
  const [walletId, setWalletId] = useState<string>("");
  const [mnemonic, setMnemonic] = useState<string>("");
  const [accounts, setAccounts] = useState<string[]>([]);
  const [print, setPrint] = useState<string[]>([]);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const wallet = await walletClient.getWallet();
        setMnemonic(wallet.mnemonic);
        setWalletId(wallet.walletId);
        setAccounts(wallet.accounts);
      } catch (error) {
        console.error("Error fetching wallet:", error);
      }
    };

    fetchWallet();
  }, []);

  const handlePrint = () => {
    setPrint(accounts);
  };

  const handleWalletCreation = async () => {
    if (!mnemonic) {
      const {
        mnemonic: newMnemonic,
        accounts,
        walletId,
      } = await walletClient.createHdWallet();
      setMnemonic(newMnemonic);
      setAccounts(accounts);
      setWalletId(walletId);
    } else {
      const { address } = await walletClient.addHdAccount(walletId);
      setAccounts((prev) => [...prev, address]);
    }
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
              <p className="text-lg font-bold">{account}</p>
            </div>
          ))}
      </div>

      <div>
        <Button onClick={handlePrint}>Print Accounts</Button>
        {print.length > 0 &&
          print.map((account, index) => (
            <div key={index} className="flex flex-col gap-4">
              <p className="mb-2 mt-4">Print Key:</p>
              <p className="text-lg font-bold">{account}</p>
            </div>
          ))}
      </div>
    </div>
  );
}

export default App;
