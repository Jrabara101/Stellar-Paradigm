# Wallet Interaction Verification — Word Scramble (Stellar Testnet)

Proof that 10+ real, distinct users connected a Stellar wallet and submitted at least one score on-chain, satisfying the Level 4 "10+ real users / proof of wallet interactions" requirement.

## Methodology

Each wallet address below was collected via an in-app feedback form, then independently cross-checked against the actual blockchain — not just taken at face value. For every address, we queried Stellar Horizon for `invoke_host_function` operations, decoded the XDR parameters, and confirmed each one:

1. Called the deployed **WordScramble contract** (`CD2XXLJBFBVYAGJYUHQR4XH6ZYWQUMR6A22TUFY4R2S3VU2NCY7KPJEG`)
2. Invoked the **`submit_score`** function specifically
3. Was a **successful** transaction (not a failed/reverted attempt)

This means every row below is backed by a real, independently-verifiable transaction hash — not self-reported data.

**Contract on Stellar Expert:** https://stellar.expert/explorer/testnet/account/CD2XXLJBFBVYAGJYUHQR4XH6ZYWQUMR6A22TUFY4R2S3VU2NCY7KPJEG

## Verified Users (10 / 10)

| # | Name | Wallet Address | Verified Txs | Latest Submission (UTC) | Proof (latest tx) |
|---|---|---|---|---|---|
| 1 | Jeric Rabara | `GAJNW5…MZZL` | 8 | 2026-07-14T06:39:41Z | [View tx](https://stellar.expert/explorer/testnet/tx/ee87bfe2dfaba136da6f401cc90aa728cce8e47d100e45031ca7010f76bdfbab) |
| 2 | Dianna Rose Magbanua | `GD5TYJ…SW5B` | 4 | 2026-07-16T01:39:31Z | [View tx](https://stellar.expert/explorer/testnet/tx/a5ae3fddedee2b2746dd633569969b8ff6a049b2c1cdc12d8571f78b7f61d3ef) |
| 3 | Nhaytan | `GBTO2F…AVYN` | 6 | 2026-07-14T06:41:56Z | [View tx](https://stellar.expert/explorer/testnet/tx/48c7ace9858526b2fa8142f665442d5a22ce953664f5a1ca9e12dccfd08a6dc5) |
| 4 | GLEN | `GAXZV6…DNED` | 2 | 2026-07-13T02:09:43Z | [View tx](https://stellar.expert/explorer/testnet/tx/c41d4ee3add5828e8d69407db236b2f0b77972012e2b3a3ac6eb3bbd9bf67f4f) |
| 5 | Richie Christian De guzman | `GBZZSG…SGBA` | 2 | 2026-07-13T11:13:23Z | [View tx](https://stellar.expert/explorer/testnet/tx/fa19a28feb63271587dfad675be18d88bcccef105f75ab2de00dc7df493eae05) |
| 6 | Kurt Justin | `GC6SFJ…HI3F` | 3 | 2026-07-16T01:47:22Z | [View tx](https://stellar.expert/explorer/testnet/tx/73c1d89cb5a3637b0600c03fd9cc179bf5a93d952617c69aaf42bdf0f8b7adf5) |
| 7 | Dayniel Talusig | `GAFP7W…43BJ` | 4 | 2026-07-14T05:32:49Z | [View tx](https://stellar.expert/explorer/testnet/tx/398a26b71cf1ec99c682db524bba05d2c25d26ce75969bfa06b8fe6cb0a38997) |
| 8 | Darid De Jesus | `GC4WWO…XRE5` | 3 | 2026-07-15T01:43:30Z | [View tx](https://stellar.expert/explorer/testnet/tx/ff1fc73b6746f6c430652c3bec1f72fb408e27ea1ac5ef62d42abb353c5f1dd9) |
| 9 | Cedrick Cadence Cornejo | `GBXUBP…XRYZ` | 2 | 2026-07-15T01:53:21Z | [View tx](https://stellar.expert/explorer/testnet/tx/bd4c47324a49c2d5195081888873c1749a824d9ebb9d461807be0f7c7b3a4c41) |
| 10 | Ricky Mark Mercado | `GBV2UC…AFUK` | 2 | 2026-07-12T14:41:17Z | [View tx](https://stellar.expert/explorer/testnet/tx/366f11ca972babb693f1ad27b5e437e71c6a1db667ddb58bda2bdd0e57e4f1ff) |

## Full Transaction Detail Per User

### 1. Jeric Rabara

**Wallet address:** `GAJNW53ROFPDIJOGKUP53HXOSWYN42IL2UDB4PB64MVZECCZ3JBGMZZL`  
**Account on Stellar Expert:** https://stellar.expert/explorer/testnet/account/GAJNW53ROFPDIJOGKUP53HXOSWYN42IL2UDB4PB64MVZECCZ3JBGMZZL  
**Verified `submit_score` transactions:** 8

- 2026-07-14T06:39:41Z — [`ee87bfe2dfaba136...`](https://stellar.expert/explorer/testnet/tx/ee87bfe2dfaba136da6f401cc90aa728cce8e47d100e45031ca7010f76bdfbab)
- 2026-07-14T06:39:06Z — [`1b9fc43502f1cb49...`](https://stellar.expert/explorer/testnet/tx/1b9fc43502f1cb49a8bffdc94abc6bc62235818295905870ebb087a42a8ad555)
- 2026-07-14T06:38:36Z — [`d4f91337f96799b6...`](https://stellar.expert/explorer/testnet/tx/d4f91337f96799b6121dd226446ca4faddd262a01eaced8003834ce6a560bebc)
- 2026-07-14T06:38:16Z — [`971f5757520aebce...`](https://stellar.expert/explorer/testnet/tx/971f5757520aebce718308eeb9cb74345fc00481e575e618943187c80d59df5d)
- 2026-07-14T06:37:41Z — [`9e1e82b7837bfa5c...`](https://stellar.expert/explorer/testnet/tx/9e1e82b7837bfa5caf1d7df78b17c390dbc9722271ccbf52286f5bd4da7e3a4c)
- 2026-07-14T06:37:16Z — [`2cb43322a640fa20...`](https://stellar.expert/explorer/testnet/tx/2cb43322a640fa20d05bd9795d5751c0690c401454b2f23d3eb30292022b06f2)
- 2026-07-12T14:08:58Z — [`f893ffa181805ede...`](https://stellar.expert/explorer/testnet/tx/f893ffa181805eded6d9ddaec4e6581c01fee763a865853fe537b5db26b218b2)
- 2026-07-12T14:07:03Z — [`8e9ddfee2c35846d...`](https://stellar.expert/explorer/testnet/tx/8e9ddfee2c35846d0f1b32378e96ad0dd5d868adc65371759f14c678de5e769f)

### 2. Dianna Rose Magbanua

**Wallet address:** `GD5TYJPVPNCEVXBQ3QISMV2KUPSNCGJWNRUKMKI6SEIWQ7JCRMNDSW5B`  
**Account on Stellar Expert:** https://stellar.expert/explorer/testnet/account/GD5TYJPVPNCEVXBQ3QISMV2KUPSNCGJWNRUKMKI6SEIWQ7JCRMNDSW5B  
**Verified `submit_score` transactions:** 4

- 2026-07-16T01:39:31Z — [`a5ae3fddedee2b27...`](https://stellar.expert/explorer/testnet/tx/a5ae3fddedee2b2746dd633569969b8ff6a049b2c1cdc12d8571f78b7f61d3ef)
- 2026-07-16T01:33:45Z — [`6c659cc98b18085b...`](https://stellar.expert/explorer/testnet/tx/6c659cc98b18085b3a27e196a45bb95a583ccd49dfa41e4e20e762c2507a243f)
- 2026-07-16T01:33:15Z — [`c62a40e1716915d1...`](https://stellar.expert/explorer/testnet/tx/c62a40e1716915d16afe0fb33866ff509f25232c798e7a2125a6a229ed06b13c)
- 2026-07-16T01:32:35Z — [`976569a813b2bf5a...`](https://stellar.expert/explorer/testnet/tx/976569a813b2bf5a82251763ed8c45295a6db63b8f0f36841900d428bc6f1c9f)

### 3. Nhaytan

**Wallet address:** `GBTO2FOP3AKLQTUWCWWYRDHVS3KBV4OQI654R66O45OVRXBYUED7AVYN`  
**Account on Stellar Expert:** https://stellar.expert/explorer/testnet/account/GBTO2FOP3AKLQTUWCWWYRDHVS3KBV4OQI654R66O45OVRXBYUED7AVYN  
**Verified `submit_score` transactions:** 6

- 2026-07-14T06:41:56Z — [`48c7ace9858526b2...`](https://stellar.expert/explorer/testnet/tx/48c7ace9858526b2fa8142f665442d5a22ce953664f5a1ca9e12dccfd08a6dc5)
- 2026-07-14T06:41:06Z — [`41997c9bc5117387...`](https://stellar.expert/explorer/testnet/tx/41997c9bc5117387ce99c0e6635ddc8326da394214320f2bc661eb2c067b8cb0)
- 2026-07-14T06:40:46Z — [`eb82f6957b1e0d1f...`](https://stellar.expert/explorer/testnet/tx/eb82f6957b1e0d1fa0799c2efd1195319f2904f2bca15972edd3e081a6435f7e)
- 2026-07-12T13:50:31Z — [`642c4f4102dbc7fa...`](https://stellar.expert/explorer/testnet/tx/642c4f4102dbc7fa3d01fc7d3258ab51d8907e803e0a2cb58b23ac6cfd0281ed)
- 2026-07-12T13:46:06Z — [`65530638527c6843...`](https://stellar.expert/explorer/testnet/tx/65530638527c684366d1ac38ff6f8eb87622bb14012f109bfbf9168bfa6a0b93)
- 2026-07-12T13:44:26Z — [`9bc3b6609fab61b4...`](https://stellar.expert/explorer/testnet/tx/9bc3b6609fab61b49ea5b29a241f8ad7cab19fd07f6492708cd3ad6a9394d88e)

### 4. GLEN

**Wallet address:** `GAXZV6P7DZVLJU6UVF3DZDHRDQCDLBMM24X3OYOZRRLF7ZN5DIJQDNED`  
**Account on Stellar Expert:** https://stellar.expert/explorer/testnet/account/GAXZV6P7DZVLJU6UVF3DZDHRDQCDLBMM24X3OYOZRRLF7ZN5DIJQDNED  
**Verified `submit_score` transactions:** 2

- 2026-07-13T02:09:43Z — [`c41d4ee3add5828e...`](https://stellar.expert/explorer/testnet/tx/c41d4ee3add5828e8d69407db236b2f0b77972012e2b3a3ac6eb3bbd9bf67f4f)
- 2026-07-13T02:06:47Z — [`de1c9b7db4ed70c8...`](https://stellar.expert/explorer/testnet/tx/de1c9b7db4ed70c85e55cc6bcb150ef7febf7d015ff5f363cbc9dc1f71e9dcb5)

### 5. Richie Christian De guzman

**Wallet address:** `GBZZSGGSWM6FSI4AJ2TETGTNB56JRLMRVNTXS2BKCZGEBSZDSK26SGBA`  
**Account on Stellar Expert:** https://stellar.expert/explorer/testnet/account/GBZZSGGSWM6FSI4AJ2TETGTNB56JRLMRVNTXS2BKCZGEBSZDSK26SGBA  
**Verified `submit_score` transactions:** 2

- 2026-07-13T11:13:23Z — [`fa19a28feb632715...`](https://stellar.expert/explorer/testnet/tx/fa19a28feb63271587dfad675be18d88bcccef105f75ab2de00dc7df493eae05)
- 2026-07-13T11:10:43Z — [`f758291cd4e89140...`](https://stellar.expert/explorer/testnet/tx/f758291cd4e891408e653dcec9f506b175b53339d8b412900f75cc1dd6f7459d)

### 6. Kurt Justin

**Wallet address:** `GC6SFJXAEDPWUQHQT6MXBZ2P2MVWWPTCBLYHDMCONOSGJXISE6I3HI3F`  
**Account on Stellar Expert:** https://stellar.expert/explorer/testnet/account/GC6SFJXAEDPWUQHQT6MXBZ2P2MVWWPTCBLYHDMCONOSGJXISE6I3HI3F  
**Verified `submit_score` transactions:** 3

- 2026-07-16T01:47:22Z — [`73c1d89cb5a3637b...`](https://stellar.expert/explorer/testnet/tx/73c1d89cb5a3637b0600c03fd9cc179bf5a93d952617c69aaf42bdf0f8b7adf5)
- 2026-07-16T01:45:26Z — [`6e66d3ff9a23f768...`](https://stellar.expert/explorer/testnet/tx/6e66d3ff9a23f76857825e6c28976b7785dc4d97fdda4d884fcba572594b3e6f)
- 2026-07-16T01:44:56Z — [`b137029ed27f8db4...`](https://stellar.expert/explorer/testnet/tx/b137029ed27f8db4ff5e67b00ca3ffd84b52b446c4990161791945f4fa03e6e8)

### 7. Dayniel Talusig

**Wallet address:** `GAFP7WUINSSCMRZBS4POXWHGK5OFNDVAQR7M77P3QMTAPGTDVSDP43BJ`  
**Account on Stellar Expert:** https://stellar.expert/explorer/testnet/account/GAFP7WUINSSCMRZBS4POXWHGK5OFNDVAQR7M77P3QMTAPGTDVSDP43BJ  
**Verified `submit_score` transactions:** 4

- 2026-07-14T05:32:49Z — [`398a26b71cf1ec99...`](https://stellar.expert/explorer/testnet/tx/398a26b71cf1ec99c682db524bba05d2c25d26ce75969bfa06b8fe6cb0a38997)
- 2026-07-14T05:32:04Z — [`68a53deaa32d942f...`](https://stellar.expert/explorer/testnet/tx/68a53deaa32d942fb714ab0a893b0903c7d80c32bcc0fdd5c3e642e944254442)
- 2026-07-14T05:29:19Z — [`4a0cc68782b16d8e...`](https://stellar.expert/explorer/testnet/tx/4a0cc68782b16d8edbcd1fc27a15831f2a1afe8e88ad373e8d57a960b8954748)
- 2026-07-14T05:26:44Z — [`19ec07ff36ad18f4...`](https://stellar.expert/explorer/testnet/tx/19ec07ff36ad18f4c5177b7b2a8831344a4c58451c6bb7792a77628200b29f73)

### 8. Darid De Jesus

**Wallet address:** `GC4WWONMOYVPEEQTYO3BISIO3F7ALUWHJ37M5GUSYYA2Q7MJKTUBXRE5`  
**Account on Stellar Expert:** https://stellar.expert/explorer/testnet/account/GC4WWONMOYVPEEQTYO3BISIO3F7ALUWHJ37M5GUSYYA2Q7MJKTUBXRE5  
**Verified `submit_score` transactions:** 3

- 2026-07-15T01:43:30Z — [`ff1fc73b6746f6c4...`](https://stellar.expert/explorer/testnet/tx/ff1fc73b6746f6c430652c3bec1f72fb408e27ea1ac5ef62d42abb353c5f1dd9)
- 2026-07-14T06:44:07Z — [`23dfd562a907e4e8...`](https://stellar.expert/explorer/testnet/tx/23dfd562a907e4e862962b24f054d85b10dc01e63311cb1cd75c62935cc55dc4)
- 2026-07-14T06:43:37Z — [`2777a8c89426226e...`](https://stellar.expert/explorer/testnet/tx/2777a8c89426226e1a48c9aa8f76da8107fd42a70e9e07a4c9d35ccd9db9814b)

### 9. Cedrick Cadence Cornejo

**Wallet address:** `GBXUBPKOA63QJ4OZB3QM7ZJAEJKFJFSCADRSM5TAS6SBKEQUZ6EYXRYZ`  
**Account on Stellar Expert:** https://stellar.expert/explorer/testnet/account/GBXUBPKOA63QJ4OZB3QM7ZJAEJKFJFSCADRSM5TAS6SBKEQUZ6EYXRYZ  
**Verified `submit_score` transactions:** 2

- 2026-07-15T01:53:21Z — [`bd4c47324a49c2d5...`](https://stellar.expert/explorer/testnet/tx/bd4c47324a49c2d5195081888873c1749a824d9ebb9d461807be0f7c7b3a4c41)
- 2026-07-14T06:42:36Z — [`2d767ceaaba1149a...`](https://stellar.expert/explorer/testnet/tx/2d767ceaaba1149a1bf895852fe0d1fddd51a5ba693eff041bc5ce7835f30693)

### 10. Ricky Mark Mercado

**Wallet address:** `GBV2UCM75ITDUOPFDLMSOHWBDNY7FPDFBYW3FRE5HM6LK7ZWFUV3AFUK`  
**Account on Stellar Expert:** https://stellar.expert/explorer/testnet/account/GBV2UCM75ITDUOPFDLMSOHWBDNY7FPDFBYW3FRE5HM6LK7ZWFUV3AFUK  
**Verified `submit_score` transactions:** 2

- 2026-07-12T14:41:17Z — [`366f11ca972babb6...`](https://stellar.expert/explorer/testnet/tx/366f11ca972babb693f1ad27b5e437e71c6a1db667ddb58bda2bdd0e57e4f1ff)
- 2026-07-12T14:39:01Z — [`e4cf1c123b3d0b80...`](https://stellar.expert/explorer/testnet/tx/e4cf1c123b3d0b80d585f43ff31adfd00378b9aa0516c49b47aeda5fd83cbbe7)

## Data Hygiene Notes

- **Dayniel Talusig** originally submitted a wallet address he later lost the password to; he created a new wallet and resubmitted. Only the working wallet (4 verified transactions) is counted above — the abandoned one is excluded entirely, not double-counted.
- **Kurt Justin** initially had a typo in his submitted address; the corrected address is fully verified above (3 transactions).
- No wallet address appears more than once in this list — all 10 are unique, distinct users.
