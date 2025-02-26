# BTM Token Smart Contract

This directory contains the CosmWasm smart contract for the BTM token implementation on the Juno Network.

## Contract Overview

The BTM token contract implements a deflationary meme token with the following features:

- Total Supply: 1,000,000,000,000 BTM
- Initial Burn Pool: 900,000,000,000 BTM (90%)
- Burn Mechanics:
  - Manual burns through click interactions (100 clicks = 1 BTM)
  - Automatic burns (0.1% of remaining burn pool every 15 days)

## Contract Structure

- `btm.rs`: Main contract implementation
  - InstantiateMsg: Contract initialization
  - ExecuteMsg: Token operations (transfer, burn, auto-burn)
  - QueryMsg: Read-only operations

## Development Setup

1. Install Rust and cargo-generate:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install cargo-generate --features vendored-openssl
cargo install cargo-run-script
```

2. Install CosmWasm toolchain:
```bash
rustup target add wasm32-unknown-unknown
```

3. Build the contract:
```bash
cargo wasm
```

## Deployment

1. Deploy to Juno testnet (uni-6):
```bash
junod tx wasm store artifacts/btm_token.wasm --from wallet --chain-id uni-6 --gas-prices 0.025ujunox --gas auto --gas-adjustment 1.3 -y
```

2. Instantiate the contract:
```bash
junod tx wasm instantiate $CODE_ID '{
  "name": "BitMeme Token",
  "symbol": "BTM",
  "decimals": 6,
  "initial_balances": [],
  "burn_pool_address": "juno...",
  "api_address": "juno..."
}' --from wallet --label "BTM Token" --chain-id uni-6 --gas-prices 0.025ujunox --gas auto --gas-adjustment 1.3 -y
```

## Security Considerations

- Only the authorized API address can trigger burns
- Rate limiting implemented at the API level
- Automatic burns are time-locked (15 days)
- All operations are protected by mutex locks

## Testing

Run the test suite:
```bash
cargo test
```

## Integration

The contract integrates with:
- Backend API for processing click events
- CronCat for automatic burns
- Frontend for displaying burn statistics

## License

MIT