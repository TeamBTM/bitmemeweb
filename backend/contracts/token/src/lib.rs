use cosmwasm_std::{Binary, Deps, DepsMut, Env, MessageInfo, Response, StdResult, Uint128, StdError, entry_point};
use cw20::{Cw20Coin, TokenInfoResponse};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use cw_storage_plus::Item;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
    pub initial_balances: Vec<Cw20Coin>,
    pub burn_pool_address: String,
    pub api_address: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    Transfer {
        recipient: String,
        amount: Uint128,
    },
    Burn {
        amount: Uint128,
    },
    AutoBurn {},
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    Balance { address: String },
    TokenInfo {},
    BurnPoolInfo {},
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct BurnPoolResponse {
    pub address: String,
    pub balance: Uint128,
}

pub const BURN_POOL: Item<BurnPoolResponse> = Item::new("burn_pool");
pub const API_ADDRESS: Item<String> = Item::new("api_address");
pub const LAST_AUTO_BURN: Item<u64> = Item::new("last_auto_burn");

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> StdResult<Response> {
    // Initialize token with 1 trillion supply (90% in burn pool)
    let total_supply = Uint128::new(1_000_000_000_000_000_000); // 1 trillion with 6 decimals
    let burn_pool_amount = total_supply.multiply_ratio(90u128, 100u128);
    
    // Set up burn pool
    BURN_POOL.save(deps.storage, &BurnPoolResponse {
        address: msg.burn_pool_address.clone(),
        balance: burn_pool_amount,
    })?;
    
    // Set API address for authorized burns
    API_ADDRESS.save(deps.storage, &msg.api_address)?;
    
    // Set last auto burn timestamp
    LAST_AUTO_BURN.save(deps.storage, &env.block.time.seconds())?;
    
    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("total_supply", total_supply)
        .add_attribute("burn_pool_amount", burn_pool_amount))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> StdResult<Response> {
    match msg {
        ExecuteMsg::Transfer { recipient: _, amount: _ } => {
            Err(StdError::generic_err("Transfer not implemented"))
        },
        ExecuteMsg::Burn { amount } => execute_burn(deps, env, info, amount),
        ExecuteMsg::AutoBurn {} => execute_auto_burn(deps, env, info),
    }
}

pub fn execute_burn(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    amount: Uint128,
) -> StdResult<Response> {
    // Only allow burns from authorized API address
    let api_address = API_ADDRESS.load(deps.storage)?;
    if info.sender.to_string() != api_address {
        return Err(StdError::generic_err("Unauthorized"));
    }
    
    let mut burn_pool = BURN_POOL.load(deps.storage)?;
    if burn_pool.balance < amount {
        return Err(StdError::generic_err("Insufficient burn pool balance"));
    }
    
    // Perform burn
    burn_pool.balance -= amount;
    BURN_POOL.save(deps.storage, &burn_pool)?;
    
    Ok(Response::new()
        .add_attribute("action", "burn")
        .add_attribute("amount", amount)
        .add_attribute("burn_pool_remaining", burn_pool.balance))
}

pub fn execute_auto_burn(
    deps: DepsMut,
    env: Env,
    _info: MessageInfo,
) -> StdResult<Response> {
    // Check if 15 days have passed since last auto burn
    let last_burn = LAST_AUTO_BURN.load(deps.storage)?;
    let now = env.block.time.seconds();
    if now - last_burn < 15 * 24 * 60 * 60 {
        return Err(StdError::generic_err("Too early for auto burn"));
    }
    
    let mut burn_pool = BURN_POOL.load(deps.storage)?;
    let burn_amount = burn_pool.balance.multiply_ratio(1u128, 1000u128); // 0.1%
    
    // Perform auto burn
    burn_pool.balance -= burn_amount;
    BURN_POOL.save(deps.storage, &burn_pool)?;
    LAST_AUTO_BURN.save(deps.storage, &now)?;
    
    Ok(Response::new()
        .add_attribute("action", "auto_burn")
        .add_attribute("amount", burn_amount)
        .add_attribute("burn_pool_remaining", burn_pool.balance))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::Balance { address: _ } => {
            Err(StdError::generic_err("Balance query not implemented"))
        },
        QueryMsg::TokenInfo {} => {
            Err(StdError::generic_err("TokenInfo query not implemented"))
        },
        QueryMsg::BurnPoolInfo {} => {
            let burn_pool = BURN_POOL.load(deps.storage)?;
            cosmwasm_std::to_binary(&burn_pool)
        },
    }
}