import { Button, Card, Input } from "@repo/ui";
import { useState } from "react";

const Onboarding = ({
  onComplete,
}: {
  onComplete: (password: string) => void;
}) => {
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function handleCreateWallet() {
    if (password && confirmPassword && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    await onComplete(password);
  }

  return (
    <Card>
      <h1>Welcome!</h1>
      <p>Let's set up your wallet password to get started.</p>

      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setPassword(e.target.value)
        }
      />
      <Input
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setConfirmPassword(e.target.value)
        }
      />
      {error && <p style={{ color: "red" }}>{error}</p>}

      <Button onClick={handleCreateWallet}>Create Wallet</Button>
    </Card>
  );
};

export default Onboarding;
