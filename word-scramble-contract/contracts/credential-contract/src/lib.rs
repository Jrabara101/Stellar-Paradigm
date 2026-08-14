#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, xdr::ToXdr, Address, Bytes, BytesN, Env,
    Symbol, Vec,
};

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Credential {
    pub id: BytesN<32>,
    pub issuer: Address,
    pub player: Address,
    pub subject: Symbol,
    pub cefr_level: Symbol,
    pub score: u32,
    pub issued_at_ledger: u32,
    pub timestamp: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    PlayerCredentials(Address),
    CredentialById(BytesN<32>),
    CredentialCounter,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
pub enum ContractError {
    NonTransferable = 1,
    CredentialNotFound = 2,
    Unauthorised = 3,
}

// Minimum score (out of 100) required for a category completion to qualify
// for a credential. Mirrors the 90%+ threshold from the Level 4 credential
// system proposal (Idea Submissions/IDEA_2_SUBMISSION.md).
const PASS_THRESHOLD: u32 = 90;

#[contract]
pub struct CredentialContract;

#[contractimpl]
impl CredentialContract {
    /// Register the deployer as admin (call once after deploy).
    pub fn init_admin(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("admin already set");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    /// Issue a soulbound credential to a player for completing `subject` at
    /// `cefr_level` with `score` (0-100). Admin-only: in this MVP the admin
    /// acts as the trusted issuer on behalf of WordScrambleContract, since
    /// the two contracts aren't wired together yet. Panics if score is below
    /// the pass threshold, so a credential can never be issued for a failing
    /// or borderline result.
    pub fn issue_credential(
        env: Env,
        admin: Address,
        player: Address,
        subject: Symbol,
        cefr_level: Symbol,
        score: u32,
    ) -> BytesN<32> {
        Self::require_admin(&env, &admin);

        if score < PASS_THRESHOLD {
            panic!("score below pass threshold");
        }

        let timestamp = env.ledger().timestamp();
        let issued_at_ledger = env.ledger().sequence();

        // The credential ID must be derivable purely from on-chain storage state,
        // not from ledger().timestamp(): Soroban's footprint is fixed at
        // simulation-time, but the transaction can apply in a later ledger with a
        // different timestamp, which would make a timestamp-derived storage key
        // fall outside the reserved footprint and trap at apply-time. A
        // persistent counter is deterministic and stable between simulate and
        // apply, so it's used for addressing instead.
        let counter: u64 = env
            .storage()
            .instance()
            .get(&DataKey::CredentialCounter)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::CredentialCounter, &(counter + 1));

        let id = Self::derive_id(&env, &admin, &player, &subject, &cefr_level, counter);

        let credential = Credential {
            id: id.clone(),
            issuer: admin.clone(),
            player: player.clone(),
            subject: subject.clone(),
            cefr_level: cefr_level.clone(),
            score,
            issued_at_ledger,
            timestamp,
        };

        env.storage()
            .persistent()
            .set(&DataKey::CredentialById(id.clone()), &credential);

        let key = DataKey::PlayerCredentials(player.clone());
        let mut ids: Vec<BytesN<32>> = env.storage().persistent().get(&key).unwrap_or(Vec::new(&env));
        ids.push_back(id.clone());
        env.storage().persistent().set(&key, &ids);

        env.events().publish(
            (Symbol::new(&env, "credential"), Symbol::new(&env, "issued")),
            (player, subject, cefr_level, id.clone()),
        );

        id
    }

    /// Return all credentials earned by a player, most recent last.
    pub fn get_credentials(env: Env, player: Address) -> Vec<Credential> {
        let ids: Vec<BytesN<32>> = env
            .storage()
            .persistent()
            .get(&DataKey::PlayerCredentials(player))
            .unwrap_or(Vec::new(&env));

        let mut out = Vec::new(&env);
        for i in 0..ids.len() {
            let id = ids.get(i).unwrap();
            if let Some(cred) = env
                .storage()
                .persistent()
                .get::<DataKey, Credential>(&DataKey::CredentialById(id))
            {
                out.push_back(cred);
            }
        }
        out
    }

    /// Publicly verify a single credential by ID. Anyone can call this via
    /// the public RPC without needing to trust the issuing platform.
    pub fn verify_credential(env: Env, credential_id: BytesN<32>) -> Result<Credential, ContractError> {
        env.storage()
            .persistent()
            .get(&DataKey::CredentialById(credential_id))
            .ok_or(ContractError::CredentialNotFound)
    }

    /// Credentials are soulbound — they can never move between wallets.
    /// Always rejects, on purpose: this is what makes a credential prove
    /// *this specific player* earned it, instead of just being a tradeable
    /// badge someone else could buy.
    pub fn transfer(_env: Env, _from: Address, _to: Address, _id: BytesN<32>) -> Result<bool, ContractError> {
        Err(ContractError::NonTransferable)
    }

    fn require_admin(env: &Env, caller: &Address) {
        caller.require_auth();
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("admin not initialised — call init_admin first");
        if caller != &stored_admin {
            panic!("unauthorised");
        }
    }

    fn derive_id(
        env: &Env,
        issuer: &Address,
        player: &Address,
        subject: &Symbol,
        cefr_level: &Symbol,
        counter: u64,
    ) -> BytesN<32> {
        let mut bytes = Bytes::new(env);
        bytes.append(&issuer.to_xdr(env));
        bytes.append(&player.to_xdr(env));
        bytes.append(&subject.to_xdr(env));
        bytes.append(&cefr_level.to_xdr(env));
        bytes.append(&Bytes::from_array(env, &counter.to_be_bytes()));
        env.crypto().sha256(&bytes).into()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Ledger};
    use soroban_sdk::Env;

    fn setup() -> (Env, Address, Address) {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(CredentialContract, ());
        let admin = Address::generate(&env);
        let client = CredentialContractClient::new(&env, &contract_id);
        client.init_admin(&admin);
        (env, contract_id, admin)
    }

    #[test]
    fn test_issue_credential_appears_for_player() {
        let (env, contract_id, admin) = setup();
        let client = CredentialContractClient::new(&env, &contract_id);
        let player = Address::generate(&env);

        client.issue_credential(
            &admin,
            &player,
            &Symbol::new(&env, "Science"),
            &Symbol::new(&env, "A1"),
            &92,
        );

        let creds = client.get_credentials(&player);
        assert_eq!(creds.len(), 1);
        assert_eq!(creds.get(0).unwrap().score, 92);
        assert_eq!(creds.get(0).unwrap().player, player);
    }

    #[test]
    #[should_panic(expected = "score below pass threshold")]
    fn test_issue_credential_rejects_low_score() {
        let (env, contract_id, admin) = setup();
        let client = CredentialContractClient::new(&env, &contract_id);
        let player = Address::generate(&env);

        client.issue_credential(
            &admin,
            &player,
            &Symbol::new(&env, "Science"),
            &Symbol::new(&env, "A1"),
            &75,
        );
    }

    #[test]
    #[should_panic(expected = "unauthorised")]
    fn test_issue_credential_rejects_non_admin() {
        let (env, contract_id, _admin) = setup();
        let client = CredentialContractClient::new(&env, &contract_id);
        let not_admin = Address::generate(&env);
        let player = Address::generate(&env);

        client.issue_credential(
            &not_admin,
            &player,
            &Symbol::new(&env, "Science"),
            &Symbol::new(&env, "A1"),
            &95,
        );
    }

    #[test]
    fn test_verify_credential_by_id() {
        let (env, contract_id, admin) = setup();
        let client = CredentialContractClient::new(&env, &contract_id);
        let player = Address::generate(&env);

        let id = client.issue_credential(
            &admin,
            &player,
            &Symbol::new(&env, "History"),
            &Symbol::new(&env, "B1"),
            &100,
        );

        let verified = client.verify_credential(&id);
        assert_eq!(verified.player, player);
        assert_eq!(verified.subject, Symbol::new(&env, "History"));
    }

    #[test]
    fn test_verify_credential_not_found() {
        let (env, contract_id, _admin) = setup();
        let client = CredentialContractClient::new(&env, &contract_id);
        let fake_id = BytesN::from_array(&env, &[0u8; 32]);

        let result = client.try_verify_credential(&fake_id);
        assert_eq!(result, Err(Ok(ContractError::CredentialNotFound)));
    }

    #[test]
    fn test_transfer_always_rejected() {
        let (env, contract_id, _admin) = setup();
        let client = CredentialContractClient::new(&env, &contract_id);
        let from = Address::generate(&env);
        let to = Address::generate(&env);
        let fake_id = BytesN::from_array(&env, &[1u8; 32]);

        let result = client.try_transfer(&from, &to, &fake_id);
        assert_eq!(result, Err(Ok(ContractError::NonTransferable)));
    }

    #[test]
    fn test_player_can_hold_multiple_credentials() {
        let (env, contract_id, admin) = setup();
        let client = CredentialContractClient::new(&env, &contract_id);
        let player = Address::generate(&env);

        env.ledger().set_timestamp(1000);
        client.issue_credential(&admin, &player, &Symbol::new(&env, "Science"), &Symbol::new(&env, "A1"), &92);
        env.ledger().set_timestamp(2000);
        client.issue_credential(&admin, &player, &Symbol::new(&env, "History"), &Symbol::new(&env, "A1"), &95);

        let creds = client.get_credentials(&player);
        assert_eq!(creds.len(), 2);
    }

    #[test]
    fn test_unknown_player_has_no_credentials() {
        let (env, contract_id, _admin) = setup();
        let client = CredentialContractClient::new(&env, &contract_id);
        let unknown = Address::generate(&env);

        let creds = client.get_credentials(&unknown);
        assert_eq!(creds.len(), 0);
    }
}
