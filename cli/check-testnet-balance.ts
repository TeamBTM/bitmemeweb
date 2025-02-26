import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import * as dotenv from "dotenv";

dotenv.config();

async function checkTestnetBalance() {
    // Connect to Juno testnet (uni-6)
    const rpcEndpoint = "https://juno-testnet-rpc.polkachu.com";
    const client = await CosmWasmClient.connect(rpcEndpoint);

    // Create wallet from mnemonic
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
        process.env.JUNO_MNEMONIC!,
        { prefix: "juno" }
    );

    const [account] = await wallet.getAccounts();
    const balance = await client.getBalance(account.address, "ujunox");
    
    console.log(`Testnet Address: ${account.address}`);
    console.log(`Testnet Balance: ${parseInt(balance.amount) / 1000000} JUNOX`);
}

checkTestnetBalance().catch(console.error);