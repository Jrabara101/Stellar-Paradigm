# Mainnet Wallet Verification — Level 6

**Network:** Stellar Public (Mainnet) · **Verified:** 2026-08-29 (UTC)

Every wallet below was verified **independently against the blockchain**, not from the app UI or a user's word. Each was checked via a read-only simulation of the leaderboard contract's `get_score` / `get_leaderboard`, cross-referenced against Stellar Horizon for account existence, creation time, sponsorship status, and real transaction history.

| Item | Value |
|---|---|
| Leaderboard contract | [`CA37MRPVFGLRRENBW75CYZVBZPWZIS2FJQDMUFYU7MSLUNKFIDV2ZCQS`](https://stellar.expert/explorer/public/contract/CA37MRPVFGLRRENBW75CYZVBZPWZIS2FJQDMUFYU7MSLUNKFIDV2ZCQS) |
| Reward contract | [`CAPRQAUNC3L54PX54ELLFHGOEIWE5GEOSOHEQ4IWBMKK6E73D32BOLF3`](https://stellar.expert/explorer/public/contract/CAPRQAUNC3L54PX54ELLFHGOEIWE5GEOSOHEQ4IWBMKK6E73D32BOLF3) |
| Credential contract | [`CDK5KW5SY2IHOBARDDFIQFTYWMECZA3RDC6NYDB3ZCWH72CKWHJJP4JN`](https://stellar.expert/explorer/public/contract/CDK5KW5SY2IHOBARDDFIQFTYWMECZA3RDC6NYDB3ZCWH72CKWHJJP4JN) |
| Fee sponsor account | [`GAI5U6DXRP4XO5TGD3JQETOA6YJTGXYQII2IBIAJFHAA4B5ILWYW3AGI`](https://stellar.expert/explorer/public/account/GAI5U6DXRP4XO5TGD3JQETOA6YJTGXYQII2IBIAJFHAA4B5ILWYW3AGI) |
| Live app | https://word-scramble-v1.surge.sh/?network=mainnet |

---

## Headline numbers

| Metric | Count |
|---|---|
| Distinct players with an on-chain score | **22** |
| — of which independent of the developer | **21** |
| Sponsor-funded accounts | 28 (20 real users + 8 developer test keys) |
| Gasless (fee-bumped) submissions paid by sponsor | **55** |
| Total sponsor fees for all 55 | 1.43 XLM |

### How the count was derived

The raw leaderboard returns **29** entries. That number is **not** the user count, and this document does not present it as one:

- **−7** entries are the developer's own CLI keypairs, used to test the sponsorship flow before real users were invited (`word-scramble-test-player` and `-2`…`-6`, plus `word-scramble-mainnet`). They are identified by resolving every alias in the local Stellar CLI keystore and excluding any address that matches.
- **= 22** distinct real players.
- **−1** is the developer's own personal xBull wallet (row 9 below), disclosed rather than omitted.
- **= 21** independent mainnet users.

---

## Verified users

Ranked by score. "Subs" counts real `invoke_host_function` operations against the leaderboard contract.

| # | Name | Wallet | Score | Lvl | Account created (UTC) | Subs | Funding |
|---|---|---|---|---|---|---|---|
| 1 | Heart Leonardo | [`GDFSBIXY…Q5RX`](https://stellar.expert/explorer/public/account/GDFSBIXYVP5H4CHIU5WBDLJLXHEJJX7QPYX5RFS7QS25BKCOUFMVQ5RX) | 2440 | 13 | 2026-08-26 01:55 | 4 | Sponsored |
| 2 | Jodessa | [`GBEAYWKA…S43W`](https://stellar.expert/explorer/public/account/GBEAYWKAZ2RNZK7466QDFPAUXEM4XZC2JVWT532VTYIRLQLUFWNES43W) | 1820 | 10 | 2026-08-26 13:14 | 2 | Sponsored |
| 3 | kent | [`GD4Q2HBQ…VCE7`](https://stellar.expert/explorer/public/account/GD4Q2HBQWR4EIENXQAQ4UIPPR3SAGMAUSD5KOSUDRVN5GMEPBYTGVCE7) | 1750 | 10 | 2026-08-25 05:37 | 2 | Sponsored |
| 4 | Paul Anthony Abalon | [`GCDIDG7B…N2JX`](https://stellar.expert/explorer/public/account/GCDIDG7BFVLSUEFQXEA5NQ5VN3U5SZ2U4OHMKS6GYIX7OKDVPJDRN2JX) | 1710 | 9 | 2026-08-26 01:36 | 2 | Sponsored |
| 5 | Ronan Ivan Cardama | [`GAFQ5C2C…TQRL`](https://stellar.expert/explorer/public/account/GAFQ5C2C2Y7S2K2CU34OUJOJYFHU3TFLANQIAARRTMZEFNILLJITTQRL) | 1500 | 9 | 2026-08-26 11:08 | 4 | Sponsored |
| 6 | Raymond Caseria | [`GDG3DXU4…52XY`](https://stellar.expert/explorer/public/account/GDG3DXU4DO37ZCNFTNBBEWMH4HQ3HXZAOC4SHSAO7B7I2UOHVPSP52XY) | 1470 | 9 | 2026-08-25 05:06 | 1 | Sponsored |
| 7 | Precious Angelique Garcia | [`GDNNA3IZ…I3LM`](https://stellar.expert/explorer/public/account/GDNNA3IZZO4QJJA5ITJ7N74WLZT5J2FQDLT62VYOLOMDWG3YCF7AI3LM) | 1430 | 8 | 2026-08-26 13:31 | 1 | Sponsored |
| 8 | Karla Christine Malonzo | [`GDYZDMVY…K7IY`](https://stellar.expert/explorer/public/account/GDYZDMVYVDGK3JLFWETODIMVITMNUQL7RAPZQ7EZIXJIGTY3652LK7IY) | 1310 | 9 | 2026-08-26 08:09 | 5 | Sponsored |
| 9 | **Jeric Rabara** *(developer)* | [`GCBX5TCN…KBQM`](https://stellar.expert/explorer/public/account/GCBX5TCNUDKTHWBUQ7FMOYSESMOCZEGJ6MR55UVFSHAM43RIBYZHKBQM) | 1280 | 8 | 2026-08-20 02:08 | 1 | Self-funded |
| 10 | Lacsamana Juan Carlo | [`GAY4PAUW…ZOJQ`](https://stellar.expert/explorer/public/account/GAY4PAUWPKHDLZIRSRSMNIJQ3TMXRD6ULJL43AACOPMTYZ7HHHT7ZOJQ) | 1280 | 7 | 2026-08-25 09:00 | 2 | Sponsored |
| 11 | Rujane Rafanan | [`GBXP7EO2…2DBA`](https://stellar.expert/explorer/public/account/GBXP7EO2EDRTK6OZQ45JFP4FCJK4VW27J7A776SKGMUQBAZLJGVY2DBA) | 1270 | 6 | 2026-08-28 18:11 | 3 | Sponsored |
| 12 | Rico | [`GDF7HHNG…JUPK`](https://stellar.expert/explorer/public/account/GDF7HHNGXVUS66FWNNQFCPNRAMHLYXZQDN5P4L2G2Y672NIVILQSJUPK) | 1230 | 8 | 2026-08-26 13:20 | 1 | Sponsored |
| 13 | Justine Guiaz | [`GCRU4DEC…RBKT`](https://stellar.expert/explorer/public/account/GCRU4DECK3L3QZEQJDZPNAREL2BKCUKD5CJPT5YAC5P6K2HCPQ62RBKT) | 1190 | 9 | 2026-08-26 02:45 | 2 | Sponsored |
| 14 | Xian Desquitado | [`GBJ6R4RI…3ICE`](https://stellar.expert/explorer/public/account/GBJ6R4RIIQC34NXWLKA75P4F3RYU7W23CC6SGIZNH6JNBLLLUICZ3ICE) | 1170 | 9 | 2026-08-26 13:03 | 3 | Sponsored |
| 15 | Kurt Joshua Cayaga | [`GDMKLNAP…3R5Y`](https://stellar.expert/explorer/public/account/GDMKLNAPPSD3FY5HTXLVOAVWEXUMPH2246WDS7NEMFQ5NFTCNOMK3R5Y) | 1110 | 8 | 2026-08-26 11:17 | 4 | Sponsored |
| 16 | Hessah | [`GDTGU7U7…QXHL`](https://stellar.expert/explorer/public/account/GDTGU7U7XH3XI5RV2VUOB6SYOVQ36R4MEXXXISIC3TQZSIJKTHATQXHL) | 1110 | 7 | 2026-08-26 13:13 | 1 | Sponsored |
| 17 | Ethel Verana | [`GBAKAGBJ…CMDZ`](https://stellar.expert/explorer/public/account/GBAKAGBJU3AGHSXYTR4XKT7FTCLZN23LJEUGDWMBPOBHZG67WY2XCMDZ) | 1100 | 7 | 2026-08-23 07:54 | 1 | Sponsored |
| 18 | Janssen Guinto | [`GAHP43IY…JTXZ`](https://stellar.expert/explorer/public/account/GAHP43IYSV2VI7EUZWTBCQLAGNDKQRE5PZTAC3VD5ZEGFHLDISPRJTXZ) | 970 | 6 | 2026-08-26 13:21 | 2 | Sponsored |
| 19 | Johnrick Abad | [`GCQQDFUW…2G6I`](https://stellar.expert/explorer/public/account/GCQQDFUWE2YJWKEGQDVDA5NDXDV5NHRMQ4LQHINZTIAZPJTJITG52G6I) | 940 | 7 | 2026-08-28 18:08 | 2 | Sponsored |
| 20 | Peter | [`GBJ2WKDR…6DQU`](https://stellar.expert/explorer/public/account/GBJ2WKDRYVE6SN56WIDZCFA627KFZMISF7SMWEPVOZR7PENE6RW66DQU) | 740 | 4 | 2026-08-26 01:48 | 1 | Sponsored |
| 21 | Jerry Rabara | [`GBHELPWL…TRNL`](https://stellar.expert/explorer/public/account/GBHELPWL4BBV7YR5ZKOZK36YK2WM4YOZBC5UMIOGDKTJCAIIJU4LTRNL) | 610 | 4 | 2026-08-20 01:36 | 1 | Self-funded |
| 22 | Anjelo Lazaro | [`GCW7C6VY…Y7R5`](https://stellar.expert/explorer/public/account/GCW7C6VYTN3GQ2OXSJABDGJM46PYY6KAEILAAZ7GQGQV7CYACSMUY7R5) | 530 | 5 | 2026-08-26 13:07 | 1 | Sponsored |

**Full data with balances and explorer links:** [`MAINNET_USERS_LEVEL6.csv`](MAINNET_USERS_LEVEL6.csv) · [Google Sheet](https://docs.google.com/spreadsheets/d/1W_9ug14yZ__HFro8doEryZ7rh1R9XNyw4BhGz9AHZtc/edit)

---

## Disclosures

This project states its own weaknesses rather than leaving them to be discovered.

**1. Row 9 is the developer's own wallet.** `GCBX5TCN…KBQM` belongs to the project author. It is included in the on-chain total of 22 for completeness but **excluded from the independent count of 21**.

**2. Eight sponsor-funded accounts are developer test keys.** Created 2026-08-21 → 08-28 to validate the sponsorship flow before and during real-user onboarding. Their secrets live in the author's local CLI keystore. Seven appear on the leaderboard and are excluded from every user figure here: `GBYADJPN…`, `GDMTMLJG…`, `GDNISAU6…`, `GCMKDU7Z…`, `GAYZDT4J…`, `GBRSAGIC…`, `GBOPRN5R…`. The eighth (`GBZ37KQD…`) was created on 2026-08-28 purely to confirm that sponsored account creation still worked after a sponsor top-up; it has no score and never appears on the leaderboard.

**3. One wallet was submitted twice under different names.** `GBJ6R4RI…3ICE` appears in the onboarding form as both "Xian Desquitado" (2026-07-25) and "Kym Baculanta" (2026-07-26). The owner is **Xian Desquitado**; the second row reused the same address in error. The wallet is counted **once**.

**4. Row 21 is the developer's brother.** Jerry Rabara connected his own self-funded wallet and played independently. Disclosed for transparency.

**5. Email addresses are not yet collected.** The onboarding form gained a required email field on 2026-08-22, after these responses were submitted. A direct collection round is in progress; the `Email` column in the CSV is intentionally blank rather than filled with placeholder data.

**6. Four players have no onboarding-form row.** Rico, Hessah, Peter, and Jerry have verified on-chain activity but have not yet submitted the feedback form.

---

## Reproducing this verification

Anyone can confirm every figure here without trusting this document.

**Read the full leaderboard** (read-only simulation — no transaction, no fee):

```bash
stellar contract invoke \
  --id CA37MRPVFGLRRENBW75CYZVBZPWZIS2FJQDMUFYU7MSLUNKFIDV2ZCQS \
  --source-account <any-funded-account> \
  --network mainnet-rpc --send=no \
  -- get_leaderboard
```

**Read one player's score:**

```bash
stellar contract invoke --id CA37MRPVFGLRRENBW75CYZVBZPWZIS2FJQDMUFYU7MSLUNKFIDV2ZCQS \
  --source-account <any-funded-account> --network mainnet-rpc --send=no \
  -- get_score --player GDFSBIXYVP5H4CHIU5WBDLJLXHEJJX7QPYX5RFS7QS25BKCOUFMVQ5RX
```

**Confirm an account is real, sponsored, and has transacted:**

```bash
curl -s https://horizon.stellar.org/accounts/<ADDRESS>
curl -s https://horizon.stellar.org/accounts/<ADDRESS>/operations?order=asc
```

A genuine sponsored player shows `sponsor` set to the sponsor account, `num_sponsored: 2`, a sequence number advanced past its starting value, and one or more `invoke_host_function` operations.

**List every account the project has funded** — the authoritative source for the 28 figure:

```bash
curl -s "https://horizon.stellar.org/accounts/GAI5U6DXRP4XO5TGD3JQETOA6YJTGXYQII2IBIAJFHAA4B5ILWYW3AGI/payments?order=asc&limit=200"
```

Filter for `type: create_account` where `funder` is the sponsor account.

---

## Fee sponsorship in practice

Level 6's advanced-feature requirement is met by **Fee Sponsorship**, and these users are the proof it works: **20 of 22 never held XLM**. Their accounts were created by the sponsor under CAP-33, and each `submit_score` was wrapped in a `FeeBumpTransaction` paid by the sponsor.

- **55 gasless submissions**, total sponsor cost **1.43 XLM** (~0.026 XLM each)
- Players paid **zero** — no wallet funding, no faucet, no exchange account
- The sponsor validates that an inner transaction targets only the real leaderboard contract's `submit_score` before co-signing, so the key cannot be tricked into paying for arbitrary transactions (see [`SECURITY.md`](SECURITY.md))

Onboarding a non-crypto player costs roughly 2 XLM in locked reserves plus ~0.03 XLM per game played.

### A note on sponsor capacity

Sponsored reserves are **locked, not spent**, and they count against the sponsor's own minimum balance. Usable capacity is therefore:

```
available = balance − (1 + 0.5 × subentry_count + 0.5 × num_sponsoring)
```

Each new player needs ~1.5 XLM of that (1.0 for two sponsored entries + 0.5 starting balance). On 2026-08-28 the sponsor held 26.67 XLM but only **0.67 XLM was available** — 26.00 XLM was locked behind `num_sponsoring: 50` — and every new account creation failed with a `transaction_failed` error until the account was topped up. Reading the raw balance alone will overstate capacity dramatically.
