import { LAMPORTS_PER_SOL, walletClient } from "@repo/wallet-core";
import { cva } from "class-variance-authority";
import { useEffect, useState } from "react";

const inputVariants = cva(
  "flex flex-col gap-4 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
        error: "border-red-500 focus:border-red-500 focus:ring-red-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const AccountDetails = ({ className, variant, address, ...props }: any) => {
  const [balance, setBalance] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchBalance() {
      try {
        setLoading(true);
        setError("");
        const balance = await walletClient.getBalance(address);
        const formattedBalance =
          (balance / LAMPORTS_PER_SOL).toFixed(5) + " SOL";
        setBalance(formattedBalance);
      } catch (error) {
        setError("Failed to fetch balance");
        console.error("Error fetching balance:", error);
      } finally {
        setLoading(false);
      }
    }

    if (address) {
      fetchBalance();
    }
  }, [address]);

  return (
    <div className={inputVariants({ variant, className })} {...props}>
      AccountDetails: {address}
      Balance: {loading ? "Loading..." : balance}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default AccountDetails;
