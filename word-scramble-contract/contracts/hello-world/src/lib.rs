#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, Vec, symbol_short};
use reward_contract::RewardContractClient;

#[contracttype]
#[derive(Clone)]
pub struct PlayerScore {
    pub player: Address,
    pub score: u32,
    pub level: u32,
}

#[contracttype]
pub enum DataKey {
    Leaderboard,
    RewardContract,
}

const MAX_ENTRIES: u32 = 10;

#[contract]
pub struct WordScrambleContract;

#[contractimpl]
impl WordScrambleContract {
    /// Store the RewardContract address so submit_score can call it.
    pub fn set_reward_contract(env: Env, reward_contract_id: Address) {
        env.storage().instance().set(&DataKey::RewardContract, &reward_contract_id);
    }

    /// Submit a score — caller must sign the transaction.
    pub fn submit_score(env: Env, player: Address, score: u32, level: u32) {
        player.require_auth();

        let mut board: Vec<PlayerScore> = env
            .storage()
            .persistent()
            .get(&DataKey::Leaderboard)
            .unwrap_or(Vec::new(&env));

        let mut found = false;
        for i in 0..board.len() {
            let entry = board.get(i).unwrap();
            if entry.player == player {
                if score > entry.score {
                    board.set(i, PlayerScore { player: player.clone(), score, level });
                }
                found = true;
                break;
            }
        }

        if !found {
            board.push_back(PlayerScore { player: player.clone(), score, level });
        }

        // Sort descending by score (bubble sort)
        let len = board.len();
        for i in 0..len {
            for j in 0..len - 1 - i {
                let a = board.get(j).unwrap();
                let b = board.get(j + 1).unwrap();
                if a.score < b.score {
                    board.set(j, b);
                    board.set(j + 1, a);
                }
            }
        }

        if board.len() > MAX_ENTRIES {
            let mut trimmed = Vec::new(&env);
            for i in 0..MAX_ENTRIES {
                trimmed.push_back(board.get(i).unwrap());
            }
            board = trimmed;
        }

        env.storage().persistent().set(&DataKey::Leaderboard, &board);

        // Emit an event so frontends can stream real-time score updates
        env.events().publish(
            (symbol_short!("score"), symbol_short!("saved")),
            (player.clone(), score, level),
        );

        // Award a badge via RewardContract (inter-contract call)
        if let Some(badge) = Self::badge_for_score(score) {
            if let Some(reward_id) = env
                .storage()
                .instance()
                .get::<DataKey, Address>(&DataKey::RewardContract)
            {
                let reward = RewardContractClient::new(&env, &reward_id);
                reward.mint_badge(&player, &badge);
            }
        }
    }

    pub fn get_leaderboard(env: Env) -> Vec<PlayerScore> {
        env.storage()
            .persistent()
            .get(&DataKey::Leaderboard)
            .unwrap_or(Vec::new(&env))
    }

    pub fn get_score(env: Env, player: Address) -> u32 {
        let board: Vec<PlayerScore> = env
            .storage()
            .persistent()
            .get(&DataKey::Leaderboard)
            .unwrap_or(Vec::new(&env));

        for i in 0..board.len() {
            let entry = board.get(i).unwrap();
            if entry.player == player {
                return entry.score;
            }
        }
        0
    }

    fn badge_for_score(score: u32) -> Option<Symbol> {
        if score >= 1000 {
            Some(symbol_short!("LEGEND"))
        } else if score >= 500 {
            Some(symbol_short!("GOLD"))
        } else if score >= 300 {
            Some(symbol_short!("SILVER"))
        } else if score >= 100 {
            Some(symbol_short!("BRONZE"))
        } else {
            None
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::Env;

    #[test]
    fn test_submit_score_appears_on_leaderboard() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(WordScrambleContract, ());
        let client = WordScrambleContractClient::new(&env, &contract_id);

        let player = Address::generate(&env);
        client.submit_score(&player, &500, &3);

        let board = client.get_leaderboard();
        assert_eq!(board.len(), 1);
        assert_eq!(board.get(0).unwrap().score, 500);
    }

    #[test]
    fn test_score_does_not_decrease() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(WordScrambleContract, ());
        let client = WordScrambleContractClient::new(&env, &contract_id);

        let player = Address::generate(&env);
        client.submit_score(&player, &800, &5);
        client.submit_score(&player, &200, &1);

        assert_eq!(client.get_score(&player), 800);
    }

    #[test]
    fn test_get_score_returns_zero_for_unknown_player() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(WordScrambleContract, ());
        let client = WordScrambleContractClient::new(&env, &contract_id);

        let unknown = Address::generate(&env);
        assert_eq!(client.get_score(&unknown), 0);
    }

    #[test]
    fn test_leaderboard_sorted_highest_first() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(WordScrambleContract, ());
        let client = WordScrambleContractClient::new(&env, &contract_id);

        let p1 = Address::generate(&env);
        let p2 = Address::generate(&env);
        let p3 = Address::generate(&env);
        client.submit_score(&p1, &100, &1);
        client.submit_score(&p2, &500, &3);
        client.submit_score(&p3, &300, &2);

        let board = client.get_leaderboard();
        assert_eq!(board.get(0).unwrap().score, 500);
        assert_eq!(board.get(1).unwrap().score, 300);
        assert_eq!(board.get(2).unwrap().score, 100);
    }

    #[test]
    fn test_empty_leaderboard_returns_empty_vec() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(WordScrambleContract, ());
        let client = WordScrambleContractClient::new(&env, &contract_id);

        let board = client.get_leaderboard();
        assert_eq!(board.len(), 0);
    }

    #[test]
    fn test_submit_score_mints_badge_via_reward_contract() {
        let env = Env::default();
        env.mock_all_auths();

        // Deploy both contracts
        let word_id = env.register(WordScrambleContract, ());
        let reward_id = env.register(reward_contract::RewardContract, ());

        let word_client = WordScrambleContractClient::new(&env, &word_id);
        let reward_client = reward_contract::RewardContractClient::new(&env, &reward_id);

        // Wire them together
        reward_client.init(&word_id);
        word_client.set_reward_contract(&reward_id);

        // Submit a GOLD-tier score
        let player = Address::generate(&env);
        word_client.submit_score(&player, &600, &5);

        // Verify the badge was minted on the RewardContract
        assert!(reward_client.has_badge(&player, &Symbol::new(&env, "GOLD")));
    }
}
