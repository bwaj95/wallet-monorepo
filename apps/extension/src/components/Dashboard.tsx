import { Button, Card, Dropdown } from "@repo/ui";
import { useEffect, useState } from "react";
import AccountDetails from "./AccountDetails";

const Dashboard = ({
  mnemonic,
  accounts,
  handleWalletCreation,
}: {
  mnemonic: string;
  accounts: string[];
  handleWalletCreation: () => void;
}) => {
  const [activePublicKey, setActivePublicKey] = useState<string>("");

  useEffect(() => {
    if (accounts.length > 0) {
      setActivePublicKey(accounts[0]);
    }
  }, []);

  const handleAccountSelection = (selectedAccount: string) => {
    setActivePublicKey(selectedAccount);
  };

  return (
    <div className={"w-2xl h-96 bg-blue-100 p-4 flex flex-col gap-4"}>
      <div className="flex flex-row gap-4">
        <Button onClick={handleWalletCreation}>Create Wallet</Button>{" "}
      </div>

      <div className="flex flex-col gap-4">
        {mnemonic && (
          <div className="text-center ">
            <p className="mb-2">Mnemonic:</p>
            <p className="text-lg font-bold">{mnemonic}</p>
          </div>
        )}

        {accounts.length > 0 && (
          <Card>
            <h2 className="text-xl font-bold mb-2 flex flex-col gap-2">
              Select Account
            </h2>
            <Dropdown options={accounts} onSelect={handleAccountSelection} />

            <Card className="mt-8">
              {activePublicKey && <AccountDetails address={activePublicKey} />}
            </Card>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
