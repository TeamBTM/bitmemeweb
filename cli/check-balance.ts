import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import * as dotenv from "dotenv";

dotenv.config();

async function checkBalance() {
    // Connect to Juno mainnet
    const rpcEndpoint = "https://rpc-juno.itastakers.com";
    const client = await CosmWasmClient.connect(rpcEndpoint);

    // Create wallet from mnemonic
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
        process.env.JUNO_MNEMONIC!,
        { prefix: "juno" }
    );

    // Get account
    const [account] = await wallet.getAccounts();
    
    // Query balance
    const balance = await client.getBalance(account.address, "ujuno");
    
    console.log(`Address: ${account.address}`);
    console.log(`Balance: ${parseInt(balance.amount) / 1000000} JUNO`);
}

checkBalance().catch(console.error);