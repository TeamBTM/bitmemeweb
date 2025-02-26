import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

async function requestTestnetTokens() {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
        process.env.JUNO_MNEMONIC!,
        { prefix: "juno" }
    );

    const [account] = await wallet.getAccounts();
    const address = account.address;

    try {
        const response = await axios.post('https://faucet.testnet.chaintools.tech/api/faucet', {
            address: address,
            chain: "uni-6",
            denom: "ujunox"
        });

        console.log('Faucet request successful!');
        console.log(`Tokens sent to: ${address}`);
        console.log('Please wait a few seconds for the transaction to be processed');
        console.log('You can also visit the faucet website directly:');
        console.log('https://faucet.testnet.chaintools.tech/uni-6/');
    } catch (error) {
        console.error('Error requesting tokens:', error.response?.data || error.message);
        console.log('\nAlternatively, you can request tokens manually at:');
        console.log('https://faucet.testnet.chaintools.tech/uni-6/');
    }
}

requestTestnetTokens().catch(console.error);