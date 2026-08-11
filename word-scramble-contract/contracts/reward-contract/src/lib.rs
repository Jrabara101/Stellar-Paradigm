#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, Vec};

#[contracttype]
pub enum DataKey {
    Badges(Address),
    Admin,
}

#[contract]
pub struct RewardContract;

#[contractimpl]
impl RewardContract {
    /// Register the WordScrambleContract address as the only authorized badge minter.
    pub fn init(env: Env, admin: Address) {
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    /// Mint a badge for a player. Only callable by the registered WordScrambleContract
    /// (the address passed to `init`) — calling this directly as any other caller panics,
    /// since a contract Address's `require_auth()` only succeeds when that contract is
    /// the direct invoker of the current call, with no signature involved.
    pub fn mint_badge(env: Env, player: Address, badge: Symbol) -> bool {
        let authorized_caller: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("reward contract not initialised — call init first");
        authorized_caller.require_auth();

        let key = DataKey::Badges(player.clone());
        let mut badges: Vec<Symbol> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(Vec::new(&env));

        // Idempotent — don't add the same badge twice
        for i in 0..badges.len() {
            if badges.get(i).unwrap() == badge {
                return false;
            }
        }

        badges.push_back(badge);
        env.storage().persistent().set(&key, &badges);
        true
    }

    /// Return all badges earned by a player.
    pub fn get_badges(env: Env, player: Address) -> Vec<Symbol> {
        env.storage()
            .persistent()
            .get(&DataKey::Badges(player))
            .unwrap_or(Vec::new(&env))
    }

    /// Check whether a player holds a specific badge.
    pub fn has_badge(env: Env, player: Address, badge: Symbol) -> bool {
        let badges: Vec<Symbol> = env
            .storage()
            .persistent()
            .get(&DataKey::Badges(player))
            .unwrap_or(Vec::new(&env));

        for i in 0..badges.len() {
            if badges.get(i).unwrap() == badge {
                return true;
            }
        }
        false
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::{Env, Symbol};

    fn setup() -> (Env, Address) {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(RewardContract, ());
        let admin = Address::generate(&env);
        let client = RewardContractClient::new(&env, &contract_id);
        client.init(&admin);
        (env, contract_id)
    }

    #[test]
    fn test_mint_badge_success() {
        let (env, contract_id) = setup();
        let client = RewardContractClient::new(&env, &contract_id);
        let player = Address::generate(&env);
        let badge = Symbol::new(&env, "GOLD");

        let minted = client.mint_badge(&player, &badge);
        assert!(minted);
        assert!(client.has_badge(&player, &badge));
    }

    #[test]
    fn test_mint_badge_idempotent() {
        let (env, contract_id) = setup();
        let client = RewardContractClient::new(&env, &contract_id);
        let player = Address::generate(&env);
        let badge = Symbol::new(&env, "SILVER");

        client.mint_badge(&player, &badge);
        let second = client.mint_badge(&player, &badge);
        assert!(!second);

        let badges = client.get_badges(&player);
        assert_eq!(badges.len(), 1);
    }

    #[test]
    fn test_player_can_earn_multiple_badges() {
        let (env, contract_id) = setup();
        let client = RewardContractClient::new(&env, &contract_id);
        let player = Address::generate(&env);

        client.mint_badge(&player, &Symbol::new(&env, "BRONZE"));
        client.mint_badge(&player, &Symbol::new(&env, "SILVER"));
        client.mint_badge(&player, &Symbol::new(&env, "GOLD"));

        let badges = client.get_badges(&player);
        assert_eq!(badges.len(), 3);
    }

    #[test]
    #[should_panic]
    fn test_mint_badge_rejects_direct_call_from_non_registered_caller() {
        // No mock_all_auths() here: this proves a plain top-level call (not routed
        // through the registered leaderboard contract) cannot satisfy
        // `authorized_caller.require_auth()` and must panic.
        let env = Env::default();
        let contract_id = env.register(RewardContract, ());
        let registered_caller = Address::generate(&env);
        let client = RewardContractClient::new(&env, &contract_id);
        client.init(&registered_caller);

        let player = Address::generate(&env);
        client.mint_badge(&player, &Symbol::new(&env, "GOLD"));
    }

}
