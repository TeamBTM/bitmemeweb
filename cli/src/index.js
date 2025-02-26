#!/usr/bin/env node

import { program } from 'commander';
import { SigningStargateClient } from '@cosmjs/stargate';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import chalk from 'chalk';
import ora from 'ora';
import dotenv from 'dotenv';

dotenv.config();

const JUNO_MAINNET = {
  chainId: 'juno-1',
  rpcEndpoint: 'https://juno-rpc.polkachu.com',
  prefix: 'juno',
  denom: 'ujuno',
  coinDecimals: 6
};

const JUNO_TESTNET = {
  chainId: 'uni-6',
  rpcEndpoint: 'https://juno-testnet-rpc.polkachu.com',
  prefix: 'juno',
  denom: 'ujunox',
  coinDecimals: 6
};

async function getWalletBalance(mnemonic, isTestnet = false) {
  const network = isTestnet ? JUNO_TESTNET : JUNO_MAINNET;
  const spinner = ora('Connecting to Juno network...').start();

  try {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: network.prefix,
    });

    const client = await SigningStargateClient.connectWithSigner(
      network.rpcEndpoint,
      wallet
    );

    const [account] = await wallet.getAccounts();
    const balance = await client.getBalance(account.address, network.denom);
    
    spinner.succeed('Successfully connected to Juno network');
    
    console.log(chalk.green('\nWallet Information:'));
    console.log(chalk.cyan('Address:'), account.address);
    console.log(chalk.cyan('Balance:'), 
      `${parseInt(balance.amount) / Math.pow(10, network.coinDecimals)} ${balance.denom.toUpperCase().replace('U', '')}`
    );
  } catch (error) {
    spinner.fail('Failed to connect to Juno network');
    console.error(chalk.red('Error:'), error.message);
  }
}

program
  .name('juno-cli')
  .description('CLI tool for interacting with Juno Network')
  .version('1.0.0');

program
  .command('balance')
  .description('Check wallet balance')
  .option('-t, --testnet', 'Use testnet instead of mainnet')
  .action(async (options) => {
    const mnemonic = process.env.JUNO_MNEMONIC;
    if (!mnemonic) {
      console.error(chalk.red('Error: JUNO_MNEMONIC environment variable not set'));
      console.log(chalk.yellow('\nPlease set your mnemonic in .env file:'));
      console.log('JUNO_MNEMONIC="your twelve word mnemonic phrase here"');
      process.exit(1);
    }
    await getWalletBalance(mnemonic, options.testnet);
  });

program.parse();