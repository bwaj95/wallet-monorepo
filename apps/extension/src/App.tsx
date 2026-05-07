import { useEffect, useState } from "react";
import "./index.css";
import {
  walletClient,
  type WalletInitializationState,
} from "@repo/wallet-core";
// import { Button } from "@repo/ui";
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard";
import Unlock from "./components/Unlock";

function App() {
  const [walletId, setWalletId] = useState<string>("");
  const [mnemonic, setMnemonic] = useState<string>("");
  const [accounts, setAccounts] = useState<string[]>([]);
  const [walletInitState, setWalletInitState] =
    useState<WalletInitializationState>("loading");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchWalletInitState() {
      try {
        const initState = await walletClient.getWalletInitState();
        console.log("wallet init state fetched: ", initState);
        setWalletInitState(initState);
      } catch (error) {
        setError("Failed to fetch wallet initialization state.");
      }
    }

    fetchWalletInitState();
  }, []);

  // const handleFetchState = async () => {
  //   try {
  //     const initState = await walletClient.getWalletInitState();
  //     console.log("wallet init state fetched: ", initState);
  //     setWalletInitState(initState);
  //   } catch (error) {
  //     setError("Failed to fetch wallet initialization state.");
  //   }
  // };

  const handleWalletCreation = async (password?: string) => {
    if (!mnemonic) {
      if (!password) {
        alert("Password is required to create a wallet");
        return;
      }

      console.log("attempting to setWalletPwd in handleWalletCreation App.tsx");
      const isPwdSet = await walletClient.setWalletPassword(password);
      if (isPwdSet) {
        console.log(
          "successfully set setWalletPwd in handleWalletCreation App.tsx",
        );
      } else {
        console.error(
          "failed to set setWalletPwd in handleWalletCreation App.tsx",
        );
        alert("Failed to set wallet password. Cannot create wallet.");
        return;
      }

      const {
        mnemonic: newMnemonic,
        accounts,
        walletId,
      } = await walletClient.createHdWallet();
      setMnemonic(newMnemonic);
      setAccounts(accounts);
      setWalletId(walletId);
      setWalletInitState("initialized");
    } else {
      const { address } = await walletClient.addHdAccount(walletId);
      setAccounts((prev) => [...prev, address]);
    }
  };

  const handleWalletUnlock = async (password: string) => {
    try {
      const wallet = await walletClient.unlockWallet(password);
      if (wallet) {
        setMnemonic(wallet.mnemonic);
        setAccounts(wallet.accounts);
        setWalletId(wallet.walletId);
        setWalletInitState("initialized");
      }
    } catch (error) {
      setError("Failed to unlock wallet.");
    }
  };

  let content;

  if (walletInitState === "loading") {
    content = <p>Loading...</p>;
  } else if (walletInitState === "uninitialized") {
    content = <Onboarding onComplete={handleWalletCreation} />;
  } else if (walletInitState === "initialized" && accounts.length === 0) {
    content = <Unlock onUnlock={handleWalletUnlock} />;
  } else if (walletInitState === "initialized" && accounts.length > 0) {
    content = (
      <Dashboard
        handleWalletCreation={handleWalletCreation}
        accounts={accounts}
        mnemonic={mnemonic}
      />
    );
  }

  return (
    <div className={" w-2xl h-96 bg-blue-100 p-4 flex flex-col gap-4"}>
      <p className=" text-2xl  ">
        Wallet Initialization State: {walletInitState}
      </p>
      {content}
      {/* <Button onClick={handleFetchState}>Fetch state</Button> */}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}

export default App;
