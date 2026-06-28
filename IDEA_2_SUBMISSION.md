# LEVEL 4 IDEA SUBMISSION

## On-Chain Vocabulary Credential System 🎓

---

**Project:** Word Scramble Extended  
**Submitted by:** Jrabara101  
**Date:** June 28, 2026  
**Track:** Production-ready MVP with institutional partnerships  
**Repository:** https://github.com/Jrabara101/Stellar-Paradigm  
**Live Demo:** https://word-scramble-v1.surge.sh

---

## Table of Contents

1. Problem Statement
2. Why Stellar?
3. Target Users
4. Technical Architecture
5. Complexity Evaluation
6. Roadmap
7. Stellar Ecosystem Alignment

---

## 1. Problem Statement

Language learning platforms (Duolingo, Memrise, Babbel) issue badges and certificates that live in proprietary databases — they disappear if the platform shuts down and cannot be verified by employers or institutions. Learners have zero portable, tamper-proof proof of vocabulary mastery.

### The Core Problem

There is no interoperable credential layer for language skills. Students cannot:

- **Prove their language level independently** — Employers must trust the platform's claim
- **Verify credentials if the platform goes offline** — All proof vanishes if the company fails
- **Prevent credential revocation** — Corporations can revoke certifications arbitrarily
- **Use credentials across multiple platforms** — Credentials are siloed in one database

### Global Impact

This creates a **trust gap** that locks millions of people out of economic opportunity:

- 1.5 billion language learners globally lack verifiable proof of proficiency
- Employers cannot independently verify language claims for remote jobs
- Schools in developing countries cannot cost-effectively issue certificates
- Freelancers on platforms like Upwork/Fiverr cannot prove language skills to international clients

### The Solution

A decentralized, on-chain credential system where:
- Credentials are permanently stored on Stellar blockchain
- No platform can revoke or modify credentials once issued
- Employers/institutions can verify independently using public RPC
- Students own their credentials, not the platform

---

## 2. Why Stellar?

Stellar is uniquely positioned to solve this problem because:

### Permanent, Tamper-Proof Storage

Soroban contracts provide immutable credential storage on-chain. Once a credential is issued, it cannot be revoked, modified, or deleted by the platform. A student's credential outlives the platform itself.

### Cryptographic Verification

Using Stellar's SEP-1 (stellar.toml), institutions can anchor their identity to an issuer address. Credentials are cryptographically signed and verifiable by any third party using public RPC — employers can independently verify without trusting the issuing platform or any intermediary.

### Low Cost at Scale

- Issuing 1,000 credentials costs ~$0.01 on Stellar
- Traditional certification bodies charge $5–$10 per credential
- Schools can afford to issue credentials to every student, not just top performers

### Financial Inclusion Alignment

Stellar's mission is **"expanding access to financial services for underbanked populations globally."** Verifiable credentials ARE financial services — they unlock economic opportunity:

- A developer in Nigeria can prove Web3 skills to a US company without relying on centralized platforms
- A student in rural India can get verifiable language credentials without expensive certification bodies
- Someone without access to traditional banking still has portable proof of their economic value

### Technical Advantages

- **Speed & Finality:** 5-second settlement means credentials are on-chain and verifiable immediately
- **Multi-wallet Support:** Students use any Stellar wallet (Freighter, Albedo, xBull)
- **Programmable:** Soroban smart contracts enable complex issuance logic, batch operations, and verification workflows

---

## 3. Target Users

### Primary Users (Direct Impact)

**Language Students (ESL/ELL)**
- ESL learners who want portable proof of vocabulary level (A1–C2 CEFR framework)
- Non-native English speakers building portfolios for remote work
- Job seekers needing verified language credentials for immigration/visa applications

**Online Educators**
- Language schools, bootcamps, and tutoring centers issuing certificates to 100+ students at once
- Independent tutors creating verifiable proof of student achievement
- Corporate training departments certifying employee language proficiency

**Freelancers & Remote Workers**
- Non-native English speakers building verifiable language portfolio for Upwork/Fiverr/LinkedIn
- Professionals seeking promotion who need certified language skills
- Job seekers in bilingual markets proving proficiency to employers

### Secondary Users (Institutional)

**Corporations**
- Tech companies verifying employee language proficiency for remote roles
- Customer service centers needing to validate multilingual support staff
- Translation agencies confirming translator language qualifications

**NGOs & Development Organizations**
- Training unemployed workers in developing countries; credentials prove job readiness
- Education non-profits helping underserved communities gain verifiable skills
- Refugee programs documenting language training for employment assistance

**Certification Bodies**
- Cambridge, TOEFL, and other official language certifiers exploring blockchain credentials as future infrastructure
- Professional certification organizations (HR, project management) interested in blockchain credentials

### Tertiary Users (Verification)

**Employers**
- HR departments independently verifying candidate language claims
- Recruitment agencies screening candidates by verified skills
- Remote companies hiring globally and needing language verification

**Government Bodies**
- Immigration agencies validating credentials for visa applications
- Labor ministries certifying job-training outcomes
- Education ministries maintaining official credential registries

---

## 4. Technical Architecture

### Smart Contract System

```
┌──────────────────────────────────────────────────────────┐
│   CredentialContract (NEW — Soroban Rust)               │
├──────────────────────────────────────────────────────────┤
│   Functions:                                             │
│   • issue_credential(player, subject, cefr_level,       │
│     score, timestamp) → mints credential               │
│   • get_credentials(player) → returns all earned certs  │
│   • revoke_credential(credential_id) → issuer only      │
│   • verify_credential(issuer, player, cred_id) → bool   │
│   • batch_issue_credentials(Vec<(player, subject)>) │
└──────────────────────────────────────────────────────────┘
           │
           └─→ WordScrambleContract (existing)
                  └─→ submit_score() emits completion events
```

### Category → Credential Mapping

| Category | Subject | CEFR Level | Words | Credential Name |
|----------|---------|-----------|-------|---|
| Science | STEM | A1 | 50 | "Basic Science Vocabulary" |
| Science | STEM | A2 | 50 | "Intermediate Science" |
| Science | STEM | B1 | 50 | "Upper Intermediate Science" |
| Science | STEM | B2 | 50 | "Advanced Science" |
| History | Humanities | A1 | 50 | "Historical Terms" |
| Anime | Pop Culture | A1 | 50 | "Anime & Manga Literacy" |
| Technology | Tech | A1 | 50 | "Tech Vocabulary Basics" |
| **Total** | **5 subjects × 4 CEFR levels** | **= 20 unique credentials** |

### Data Flow

```
1. Student plays Word Scramble game
   ↓
2. Completes Science category at 90%+ accuracy
   ↓
3. WordScrambleContract emits "category_completed" event
   ↓
4. CredentialContract receives event
   ↓
5. Mints non-transferable credential with:
   • Issuer address (your contract)
   • Player wallet (student)
   • Subject (e.g., "Science")
   • CEFR Level (e.g., "A1")
   • Score (92/100)
   • Timestamp (ledger sequence)
   • Credential ID (hash of issuer + player + subject + timestamp)
   ↓
6. Credential stored on-chain FOREVER
   ↓
7. Student gets shareable verification link:
   https://stellar.expert/contract/CDX.../credential/abc123
   ↓
8. Employer/school verifies using public RPC:
   curl https://soroban-testnet.stellar.org \
     -X POST \
     -d '{"method": "get_credential", "id": "abc123"}'
   ↓
9. Response confirms:
   ✓ Credential exists
   ✓ Student wallet matches
   ✓ Issuer is verified
   ✓ Score and timestamp
```

### Frontend Integration (React)

```jsx
// CredentialCard.jsx
export function CredentialCard({ credential }) {
  return (
    <div className="credential-card">
      <h3>🎓 {credential.subject} {credential.cefr_level}</h3>
      <p>Earned: {formatDate(credential.timestamp)}</p>
      <p>Score: {credential.score}/100</p>
      
      <button onClick={() => copyVerificationLink(credential.id)}>
        Copy Verification Link
      </button>
      
      <p className="soulbound-badge">Soulbound — Non-transferable</p>
    </div>
  );
}
```

### Database Schema (Contract Storage)

```rust
pub enum DataKey {
    Credentials,           // Map<credential_id, Credential>
    PlayerCredentials,     // Map<player, Vec<credential_id>>
    RevokedCredentials,    // Set<credential_id>
    CredentialCounter,     // u64 (for unique IDs)
}

pub struct Credential {
    pub id: [u8; 32],                    // hash(issuer + player + subject + timestamp)
    pub issuer: Address,                 // Your contract address
    pub player: Address,                 // Student wallet
    pub subject: Symbol,                 // "Science", "History", etc.
    pub cefr_level: Symbol,              // "A1", "A2", "B1", "B2"
    pub score: u32,                      // 0-100
    pub timestamp: u64,                  // Ledger timestamp
    pub issued_at_ledger: u32,          // Ledger sequence (immutable proof)
}
```

---

## 5. Complexity Evaluation

### Technical Challenges

#### 1. Non-Transferable (Soulbound) Tokens

**Challenge:** Credentials must be bound to a single wallet, not tradeable. Prevent credential marketplace abuse (buying someone else's degree).

**Solution:**
```rust
pub fn transfer(env: Env, from: Address, to: Address, id: u64) -> Result<bool, ContractError> {
    Err(ContractError::NonTransferable) // Always reject transfers
}
```

**Difficulty:** Medium

---

#### 2. Unique Credential IDs

**Challenge:** Each credential needs a unique, tamper-proof ID. Cannot use simple incrementing numbers (predictable, easy to forge).

**Solution:** Cryptographic hash of immutable data
```rust
let cred_id = env.crypto().keccak256(&(
    issuer.clone() +
    player.clone() +
    subject.clone() +
    env.ledger().timestamp()
).as_bytes());
```

**Difficulty:** Low

---

#### 3. Credential Schema Storage

**Challenge:** Store metadata on-chain (issuer, subject, CEFR level, score, timestamp, issuer signature). Each credential ~500 bytes. Soroban has storage limits.

**Solution:** Compact encoding
- Use short symbols: "SCI-A1" instead of "Science-Level-A1"
- Store arrays in Vec<u8> for batch operations
- Pagination for retrieving large credential sets

**Difficulty:** Medium

---

#### 4. Revocation Without Rewriting History

**Challenge:** Issuer can revoke credentials (if cheating detected), but revocation cannot erase the historical fact that the credential was issued.

**Solution:** Separate immutable and mutable storage
```rust
// Issued credentials (immutable — never deleted)
let issued = env.storage().persistent().get::<_, Set<[u8; 32]>>(&DataKey::Issued);

// Revoked credentials (mutable — can grow)
let revoked = env.storage().persistent().get::<_, Set<[u8; 32]>>(&DataKey::Revoked);

pub fn verify(id: [u8; 32]) -> bool {
    issued.contains(&id) && !revoked.contains(&id)
}
```

**Difficulty:** Medium

---

#### 5. Public Verification URLs

**Challenge:** Generate shareable links like `stellar.expert/contract/.../credential/123` that are human-readable and permanent.

**Solution:** Frontend constructs URL from contract address + credential ID, fetches from public RPC to verify
```javascript
// Frontend
const verificationLink = `https://stellar.expert/contract/${contractId}?cred_id=${credentialId}`;

// User clicks link → frontend calls RPC:
const cred = await rpc.getCredential(contractId, credentialId);
```

**Difficulty:** Low

---

#### 6. Batch Issuance for Schools

**Challenge:** Schools want to issue 100+ credentials in one operation. Cannot mint 100 credentials in 100 separate transactions (too slow, too expensive).

**Solution:** Single batch operation
```rust
pub fn batch_issue_credentials(
    env: Env,
    players: Vec<Address>,
    subject: Symbol,
    scores: Vec<u32>,
) -> u64 {
    let mut count = 0;
    for i in 0..players.len() {
        Self::issue_credential(env.clone(), players.get(i), subject.clone(), scores.get(i));
        count += 1;
    }
    count
}
```

**Limitation:** Soroban has ledger entry limits (~10 KB per tx). Test optimal batch size: 50–100 credentials per transaction.

**Difficulty:** Medium

---

#### 7. CEFR Level Progression Logic

**Challenge:** Completing one subject at A1 = one credential. Completing 5 subjects at A1 = bonus "Polyglot A1" credential.

**Solution:** Track progress in contract storage
```rust
pub fn get_completion_count(player: Address, cefr_level: Symbol) -> u32 {
    let key = format!("completions:{}:{}", player, cefr_level);
    env.storage().persistent().get(&key).unwrap_or(0)
}

// Auto-mint bonus credential when count reaches 5
if Self::get_completion_count(player, cefr_level) == 5 {
    Self::issue_credential(env, player, symbol_short!("POLYGLOT"), cefr_level);
}
```

**Difficulty:** Low

---

#### 8. Institutional Verification Integration

**Challenge:** Schools/employers need to verify credentials in bulk without manually checking each one.

**Solution:** Verification SDK
```rust
// Contract exposes public verification function
pub fn verify_credential(
    issuer: Address,
    player: Address,
    credential_id: [u8; 32],
) -> Credential {
    // Public read — anyone can call
    // Returns credential or error
}

// Employer uses public RPC to verify batch:
async function verifyCredentials(schoolAddress, studentAddresses) {
    const verified = [];
    for (const student of studentAddresses) {
        const cred = await rpc.invoke(schoolAddress, 'verify_credential', [student]);
        verified.push(cred);
    }
    return verified;
}
```

**Difficulty:** Low

---

### Summary of Complexity

| Challenge | Difficulty | Time |
|-----------|-----------|------|
| Soulbound tokens | Medium | 3–4 hours |
| Unique credential IDs | Low | 1–2 hours |
| Schema storage optimization | Medium | 4–5 hours |
| Revocation logic | Medium | 3–4 hours |
| Batch issuance | Medium | 4–5 hours |
| CEFR progression | Low | 2–3 hours |
| Public verification | Low | 2–3 hours |
| **Total MVP** | **Medium–High** | **20–25 hours** |

---

## 6. Roadmap

### Phase 1: MVP Development (Weeks 1–2)

**What to Build:**

- CredentialContract (Soroban) with 6 core functions:
  - `issue_credential(player, subject, cefr_level, score, timestamp)`
  - `get_credentials(player)`
  - `revoke_credential(credential_id)`
  - `verify_credential(issuer, player, cred_id)`
  - `batch_issue_credentials(Vec<(player, subject, score)>)`
  - `get_credential_metadata(credential_id)`

- 20 credential types (5 subjects × 4 CEFR levels)
- Soulbound implementation (no transfers)
- 4 Soroban unit tests (mint, revoke, batch, verification)
- Frontend credential display in Word Scramble game
- GitHub Actions CI/CD for contract tests

**Deliverables:**
- ✅ Testnet credentials students can share and verify
- ✅ Shareable verification links per credential
- ✅ On-chain credential history (immutable ledger)
- ✅ Updated README with credential system architecture

**Timeline:** 2 weeks  
**Estimated effort:** 20–25 hours

---

### Phase 2: Institutional Partnerships (Weeks 3–4)

**What to Build:**

- Admin dashboard for schools:
  - Import student rosters (CSV)
  - Configure custom credential subjects
  - Batch-issue credentials to cohorts
  - View credential issuance history and analytics

- Verification SDK:
  - Schools/employers can verify credentials in bulk via API
  - Public RPC integration for independent verification

**Partnerships:**

Outreach to 5 language schools / bootcamps:
- Pitch: "Issue verifiable credentials to your students on blockchain — 0.5 XLM per credential"
- Goal: Get 1 school committed to pilot program

**Marketing:**
- LinkedIn posts: "We're issuing on-chain credentials for language students"
- Twitter: "Your language skills are now verifiable on Stellar"
- School case study: "How [School Name] uses blockchain for student credentials"
- Discord community: Announce credential system to Stellar/Word Scramble communities

**Deliverables:**
- ✅ First school live on testnet, issuing real credentials to real students
- ✅ Admin dashboard deployed
- ✅ Verification SDK published on GitHub
- ✅ 500+ test credentials issued

**Timeline:** 2 weeks  
**Estimated effort:** 15–20 hours

---

### Phase 3: Mainnet Launch (Month 2–3)

**What to Build:**

- Production CredentialContract on Stellar mainnet
- Integration with Stellar Anchors for institutional XLM access
- LinkedIn badge integration (students can add credentials to profiles)
- Employer verification portal

**Go-Live:**

- Schools go live issuing real credentials (XLM cost is real: $0.01–$0.05 per credential)
- Marketing campaign: announcement on Stellar community channels, Twitter, LinkedIn

**Revenue Model:**
- Schools pay 0.5 XLM per credential issued (split: 0.25 XLM to you + 0.25 XLM to fund operations)
- Example: 1 school × 1000 credentials/month = 250 XLM to you per month

**Deliverables:**
- ✅ Mainnet CredentialContract deployed
- ✅ 5–10 schools issuing credentials
- ✅ 5,000+ credentials issued
- ✅ ~5–10 XLM monthly recurring revenue

**Timeline:** 4–6 weeks  
**Estimated effort:** 20–30 hours

---

### Phase 4: Expansion (Month 3–6)

**New Credential Types:**
- Expand beyond language: tech skills, professional certifications, bootcamp diplomas
- Partner with coding bootcamps (General Assembly, Springboard)
- Partner with HR certification bodies

**Marketplace:**
- Build "skills marketplace": employers search for and verify specific credential types
- Reputation system: employers rate credential quality, informing future issuance

**Partnerships:**
- Official language certification bodies (Cambridge, TOEFL) explore blockchain co-issuance
- Government education ministries in developing countries
- NGOs training unemployed workers in Africa/SE Asia

**Long-term Vision:**
- 100,000+ credentials issued on Stellar
- "Credentials as the new resume" — employers verify on-chain instead of LinkedIn
- Stellar becomes the de facto standard for verifiable skills on blockchain

**Timeline:** 3–4 months  
**Revenue:** 50+ XLM monthly by Month 6

---

## Success Metrics

| Metric | Week 2 | Week 4 | Month 3 | Month 6 |
|--------|--------|--------|---------|---------|
| Credentials issued | 0 | 100 | 5,000 | 50,000+ |
| Institutional partners | 0 | 1 pilot | 5–10 | 20+ |
| Monthly revenue (XLM) | 0 | 0 | 5–10 | 50+ |
| Mainnet status | Testnet | Testnet | Live | Growing |
| GitHub stars | — | — | 50+ | 150+ |

---

## 7. Stellar Ecosystem Alignment

### Alignment with Stellar's Core Strengths

This credential system leverages Stellar's fundamental capabilities:

#### Asset Tokenization
- Each credential is a tokenized asset on-chain
- Aligned with [Stellar's asset tokenization framework](https://stellar.org/use-cases/tokenization)
- Non-transferable tokens (Soulbound) are a new credential type enabled by Soroban

#### Payments Infrastructure
- Micro-payment model (0.5 XLM per credential) enabled by Stellar's low fees
- Schools cannot afford per-credential costs on Ethereum or Polygon
- Soroban's performance makes batch issuance economically viable

#### On/Off Ramps
- Schools access XLM via [Stellar Anchors](https://stellar.org/learn/anchor-basics) for local currency conversion
- Regional anchors (Africa, SE Asia, Latin America) enable global school participation
- Enables fiat payment flow: School pays in USD → Anchor converts to XLM → Credentials issued

#### Financial Inclusion
- Directly aligned with [Stellar's mission](https://stellar.org) to expand access to financial services
- Verifiable credentials unlock economic opportunity for underbanked populations
- Benefits developing countries where traditional certification infrastructure is absent

---

### Stellar Resources Leveraged

| Resource | Purpose | Link |
|----------|---------|------|
| Soroban Contracts | Credential storage + verification | [Soroban docs](https://developers.stellar.org/docs/learn/soroban) |
| SEP-1 stellar.toml | Issuer identity anchoring | [SEP-1 spec](https://stellar.org/protocol/sep-1) |
| Stellar RPC | Public verification endpoint | [RPC docs](https://developers.stellar.org/docs/tools/rpc) |
| Stellar Anchors | Institutional XLM onboarding | [Anchor basics](https://stellar.org/learn/anchor-basics) |
| Multi-wallet support | Student wallet flexibility | [Wallets Kit](https://github.com/Creit-Tech/Stellar-Wallets-Kit) |

---

### Partnership Opportunities

| Partner | Opportunity | Benefit |
|---------|-----------|---------|
| Stellar Development Foundation | Funding via Stellar Community Fund | Scale from 1 school → 100+ schools |
| Stellar Anchors (regional) | Institutional XLM conversion | Remove friction for school sign-ups |
| Wallet providers (Freighter, Lobstr) | Credential display in UI | Reach millions of wallet users |
| Language schools (global) | Co-issuance partnerships | Recurring revenue + adoption |
| NGOs (UNESCO, UNWFP) | Impact programs for refugee training | Social impact + scale |

---

## Why This Will Win at Level 4

✅ **Technical Depth**
- Soulbound tokens, batch issuance, cryptographic verification, institutional APIs
- Spans Soroban, RPC, SEP-1, multi-wallet, CI/CD

✅ **Real-World Problem**
- 1.5 billion language learners lack verifiable credentials
- $20+ billion global education/certification market
- Clear pain point: centralized platforms cannot be trusted

✅ **Stellar Alignment**
- Financial inclusion: unlocks economic opportunity
- Asset tokenization: credentials as on-chain assets
- Payments: micro-payment model for issuance
- Ecosystem: integrates anchors, wallets, RPC

✅ **Enterprise Ready**
- Institutional partnerships with schools and certification bodies
- Admin dashboard + API for integration
- Verifiable from day one (not dependent on your platform)

✅ **Revenue Model**
- Sustainable: institutions pay per credential
- Scalable: 0.5 XLM × 1000 credentials = recurring revenue
- Profitable: low operational cost + high institutional demand

✅ **Global Impact**
- Helps underbanked students in developing countries
- Removes trust barrier for employers hiring globally
- Provides permanent, portable proof of skills

✅ **Fundable**
- Stellar Community Fund actively funds educational + financial inclusion projects
- Demonstrates understanding of Soroban depth + ecosystem integration
- Clear roadmap from MVP → partnerships → scale

---

## Next Steps

1. **Weeks 1–2:** Build CredentialContract MVP on testnet
2. **Weeks 3–4:** Reach out to 5 language schools; get 1 pilot commitment
3. **Month 2:** Deploy to mainnet with first school live
4. **Month 2–3:** Scale to 5–10 schools, establish revenue flow
5. **Month 3+:** Expand credential types, pursue enterprise partnerships

---

## Attachments

- GitHub repository: [Stellar-Paradigm](https://github.com/Jrabara101/Stellar-Paradigm)
- Live demo: [word-scramble-v1.surge.sh](https://word-scramble-v1.surge.sh)
- Demo video: [Video/Word Scramble Video.mp4](Video/Word%20Scramble%20Video.mp4)

---

**Submitted:** June 28, 2026  
**Contact:** prdgmcreatives2@gmail.com

