const SOLANA_RPC_URL = "https://api.devnet.solana.com";
export const LAMPORTS_PER_SOL = 1_000_000_000;

async function solanaRpcRequest<T>(method: string, params?: any[]): Promise<T> {
  try {
    const requestBody = {
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params: params || [],
    };

    const response = await fetch(SOLANA_RPC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    // data is either { jsonrpc: "2.0", id: number, result: any } or { jsonrpc: "2.0", id: number, error: { code: number, message: string } }

    if (data.error) {
      throw new Error(data.error || "Unknown RPC error");
    }

    return data.result as T;
  } catch (error) {
    if ((error as any).message && (error as any).code) {
      const rpcError = error as { message: string; code: number };
      throw new Error(`RPC Error ${rpcError.code}: ${rpcError.message}`);
    }

    throw new Error("Solana RPC request failed: " + error);
  }
}

export async function getBalance(
  address: string,
  options?: { commitment: string },
): Promise<number> {
  const result = (await solanaRpcRequest("getBalance", [address, options])) as {
    value: number;
  };

  return result.value;
}
