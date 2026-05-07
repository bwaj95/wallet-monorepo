import { Button } from "@repo/ui";

const Dashboard = ({
  mnemonic,
  accounts,
  handleWalletCreation,
}: {
  mnemonic: string;
  accounts: string[];
  handleWalletCreation: () => void;
}) => {
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

        {accounts.length > 0 &&
          accounts.map((account, index) => (
            <div key={index} className="flex flex-col gap-4">
              <p className="mb-2 mt-4">Public Key:</p>
              <p className="text-lg font-bold">{account}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Dashboard;
