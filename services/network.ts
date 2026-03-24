import { createSolanaRpc, createSolanaRpcSubscriptions, devnet } from "@solana/kit";

const DEVNET_API_URL = Deno.env.get("SOLANA_API_URL" ) ?? "api.devnet.solana.com"

export const rpc = createSolanaRpc(devnet(`https://${DEVNET_API_URL}`));
export const rpcSubscriptions = createSolanaRpcSubscriptions(devnet(`wss://${DEVNET_API_URL}}`));
