import { Button, Card, Input } from "@repo/ui";
import { useState } from "react";

const Unlock = ({ onUnlock }: { onUnlock: (password: string) => void }) => {
  const [password, setPassword] = useState<string>("");

  async function handleUnlockWallet() {
    if (!password) {
      alert("Please enter a password");
      return;
    }

    await onUnlock(password);
  }

  return (
    <Card>
      <h1>Unlock Your Wallet</h1>
      <Input
        label="Enter Password"
        type="password"
        value={password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setPassword(e.target.value)
        }
      />

      <Button onClick={handleUnlockWallet}>Unlock Wallet</Button>
    </Card>
  );
};

export default Unlock;
