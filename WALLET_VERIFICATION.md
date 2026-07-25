# Wallet Interaction Verification — Word Scramble (Stellar Testnet)

Proof that **51 distinct, real users** each connected a Stellar wallet and submitted at least one score **on-chain**, satisfying the Level 5 "50+ testnet users / real transaction activity / active usage proof" requirement.

- **Distinct verified users:** 51 / 51 (100% of distinct wallets have a real, successful on-chain `submit_score`)
- **Total form responses collected:** 52
- **Total verified `submit_score` transactions:** 182
- **Average rating:** 4.8 / 5  ·  **Would play again:** 51 / 52

Every row below is backed by a real, independently-verifiable transaction hash on Stellar's public ledger — not self-reported data.

## Methodology

Each wallet address was collected via the in-app feedback Google Form, then independently cross-checked against the blockchain — not taken at face value. For every address we queried Stellar Horizon for `invoke_host_function` operations, decoded the XDR parameters, and confirmed each one:

1. Invoked the deployed **WordScramble contract** (see both deployments below)
2. Called the **`submit_score`** function specifically (decoded from the operation's `Sym` parameter)
3. Was a **successful** transaction (`transaction_successful = true`, not a failed/reverted attempt)

## Contract Deployments

The game was redeployed during the testing window; both deployments are legitimate and both are counted:

- **v2 (current, in `stellar.js`):** `CDTTHP4T5IUDCG2MWJJZXOF5LUHXWMHN54E4PKKRQ56FSEQHSTIILWH3`  
  [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CDTTHP4T5IUDCG2MWJJZXOF5LUHXWMHN54E4PKKRQ56FSEQHSTIILWH3)
- **v1 (original — the earliest testers submitted here pre-redeploy):** `CD2XXLJBFBVYAGJYUHQR4XH6ZYWQUMR6A22TUFY4R2S3VU2NCY7KPJEG`  
  [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CD2XXLJBFBVYAGJYUHQR4XH6ZYWQUMR6A22TUFY4R2S3VU2NCY7KPJEG)

Of the 51 distinct users, 21 most recently submitted to v2 and 30 to v1 (by their latest transaction).

## Verified Users (51 / 51)

| # | Name | Wallet Address | Verified `submit_score` Txs | Latest Submission (UTC) | Contract | Proof (latest tx) |
|---|---|---|---|---|---|---|
| 1 | Jeric Rabara | `GAJNW5…MZZL` | 8 | 2026-07-14T06:39:41Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/ee87bfe2dfaba136da6f401cc90aa728cce8e47d100e45031ca7010f76bdfbab) |
| 2 | Dianna Rose Magbanua | `GD5TYJ…SW5B` | 4 | 2026-07-16T01:39:31Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/a5ae3fddedee2b2746dd633569969b8ff6a049b2c1cdc12d8571f78b7f61d3ef) |
| 3 | Nhaytan | `GBTO2F…AVYN` | 6 | 2026-07-14T06:41:56Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/48c7ace9858526b2fa8142f665442d5a22ce953664f5a1ca9e12dccfd08a6dc5) |
| 4 | GLEN | `GAXZV6…DNED` | 2 | 2026-07-13T02:09:43Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/c41d4ee3add5828e8d69407db236b2f0b77972012e2b3a3ac6eb3bbd9bf67f4f) |
| 5 | Richie Christian De guzman | `GBZZSG…SGBA` | 2 | 2026-07-13T11:13:23Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/fa19a28feb63271587dfad675be18d88bcccef105f75ab2de00dc7df493eae05) |
| 6 | Kurt Justin | `GC6SFJ…HI3F` | 12 | 2026-07-20T14:25:50Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/9c4078df57301cb3769664b0e3282869775f5eab7b58aeb38946bd7862578113) |
| 7 | Dayniel Talusig | `GAFP7W…43BJ` | 4 | 2026-07-14T05:32:49Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/398a26b71cf1ec99c682db524bba05d2c25d26ce75969bfa06b8fe6cb0a38997) |
| 8 | Darid De Jesus | `GC4WWO…XRE5` | 3 | 2026-07-15T01:43:30Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/ff1fc73b6746f6c430652c3bec1f72fb408e27ea1ac5ef62d42abb353c5f1dd9) |
| 9 | Cedrick Cadence Cornejo | `GBXUBP…XRYZ` | 2 | 2026-07-15T01:53:21Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/bd4c47324a49c2d5195081888873c1749a824d9ebb9d461807be0f7c7b3a4c41) |
| 10 | Ricky Mark Mercado | `GBV2UC…AFUK` | 2 | 2026-07-12T14:41:17Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/366f11ca972babb693f1ad27b5e437e71c6a1db667ddb58bda2bdd0e57e4f1ff) |
| 11 | kent | `GD4Q2H…VCE7` | 4 | 2026-07-23T15:24:06Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/e63f76299e111e803779927ac2714d4c387dd505a64ac888c6671daaa7ef2a2f) |
| 12 | Lacsamana Juan Carlo | `GAY4PA…ZOJQ` | 5 | 2026-07-24T15:28:10Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/48af89c5f3e318d0f134129ccf7505d154aef1bddceb5fa56d5aa57d9df5bb64) |
| 13 | Raymond Deguzman | `GCN5BX…MNN7` | 3 | 2026-07-23T15:35:27Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/ac1618d32e6bfe2eb4dc60ae7f1f26ee74805af0c6b56d455d95b109f2c5007c) |
| 14 | Johnrick Abad | `GCQQDF…2G6I` | 3 | 2026-07-25T16:21:32Z | v2 | [View tx](https://stellar.expert/explorer/testnet/tx/629734ecb05df34bef440c11d84e6d681af727325a4c9ad72b5800acae9ba327) |
| 15 | Alvin Joseph | `GADVI3…N4U6` | 2 | 2026-07-23T14:24:39Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/caaa07b79a3e6a6aba03d96f74af5009a195b08874bfce92869ed0500766f2b6) |
| 16 | Arlyn Gamores | `GAUXEY…HK6A` | 3 | 2026-07-23T14:34:15Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/558e361a5359e71427466ae832d10d09623b75ed8c599abdec228a6d301e088e) |
| 17 | Zurick Misola Comia | `GBOPRN…OVUF` | 3 | 2026-07-23T14:44:06Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/f1f3c819c610bdc11ed56b312a9c8735a9ff8c76d056861b8c320b5d0026e646) |
| 18 | Ethel Verana | `GBAKAG…CMDZ` | 4 | 2026-07-23T15:06:34Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/7b80159b070b7ce78947f5872d0ab8a1fab21bb0dc1b3d0d33752dda615d209e) |
| 19 | Raymond Caseria | `GDG3DX…52XY` | 4 | 2026-07-23T15:14:45Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/234163eeb99037f2fbf05f8405ce7990b2f2774cd2bdc5ec66185d6d6607d341) |
| 20 | Jian Daniel Desquitado | `GA3JPW…VANX` | 3 | 2026-07-23T15:42:03Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/20f7adc643983cf6e7d369177cc90e4e82556ae089186473e5ecd41384b5a923) |
| 21 | Ezekielle Liwanag Gambong | `GBKONG…5ACQ` | 5 | 2026-07-24T14:59:41Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/652e0f9d9675d510d9b04f709fe3f06fa66752074b4c81ea828574630e1566ed) |
| 22 | Mely Valenzuela | `GAKHHD…NCCI` | 3 | 2026-07-24T15:06:57Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/a7c2f28c40a9bf8ce95725d8f0ca6c29b4742d8ff6f37618134d4a68fb209eb2) |
| 23 | Regina Reg | `GCEWJI…523C` | 3 | 2026-07-24T15:16:48Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/d64e96ea4aecfa3ed1c1337f288ae73a15548fe126f1f9aac8f03c8ad744f76b) |
| 24 | Ethel Verana | `GCBX5T…KBQM` | 3 | 2026-07-25T16:26:08Z | v2 | [View tx](https://stellar.expert/explorer/testnet/tx/f844d71d92694820fe4006e2037921b4c7a631704eb00b0cb18b67c0e6b396b7) |
| 25 | Paul Anthony Abalon | `GCDIDG…N2JX` | 5 | 2026-07-24T15:36:56Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/810990ca72004a131e2b8263735708d7c273e703505276cb1b7c1d361aa54602) |
| 26 | Heart Leonardo | `GDFSBI…Q5RX` | 5 | 2026-07-24T16:03:19Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/224de96a0412e07a0d5e90debc6185a7d997f2d1ec737df5eb1b5676dcf6ccb6) |
| 27 | Justine Guiaz | `GCRU4D…RBKT` | 4 | 2026-07-24T16:08:24Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/1d1441ec3e397472fba9261652ede7de6ceb4d88177a6edcb5c36f21e3c3f44e) |
| 28 | Karla Christine Malonzo | `GDYZDM…K7IY` | 3 | 2026-07-24T16:12:20Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/be5b33bafbf7b45784cf52abfed05df96dafc82d4b39ac2e0db0e57e904a4277) |
| 29 | Ronan Ivan Cardama | `GAFQ5C…TQRL` | 2 | 2026-07-24T16:23:56Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/69908819b5182d65c1f5d240be756666178074daee15c76a97d3e4186257daf2) |
| 30 | Rujane Rafanan | `GBXP7E…2DBA` | 3 | 2026-07-25T06:36:27Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/d1534bb611662e296379fc237515374bee725a81449207177020a0117d3fbff2) |
| 31 | Jenald Aldrin Rojas | `GAERS4…HVOB` | 3 | 2026-07-25T06:49:44Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/8b8932f6f5a371906e42dc8e74c446e096e6aa4d601bfdec974bdd2771cefaa2) |
| 32 | Kurt Joshua Cayaga | `GDMKLN…3R5Y` | 2 | 2026-07-25T07:13:06Z | v1 | [View tx](https://stellar.expert/explorer/testnet/tx/1b33f6a6a9fb9a8547a948a7077982e4fbba690311c83e606559fa3c219ee449) |
| 33 | Clarette Consulta | `GAKA3I…EJ2F` | 3 | 2026-07-25T07:37:29Z | v2 | [View tx](https://stellar.expert/explorer/testnet/tx/775f94ab322b506759f21d1051aa48a0e6bdf1becde1a5f918c2a5d4ee232dac) |
| 34 | Jodessa | `GBEAYW…S43W` | 4 | 2026-07-25T07:53:46Z | v2 | [View tx](https://stellar.expert/explorer/testnet/tx/0a292792d7e0693aaab180113766099c78ad05ae0262e2556c4437232d23b5d2) |
| 35 | Janssen Guinto | `GAHP43…JTXZ` | 3 | 2026-07-25T07:58:46Z | v2 | [View tx](https://stellar.expert/explorer/testnet/tx/c16033df65d320cb5632d05a97252f1a4e6165963136c35b2ac3a1741744fbac) |
| 36 | Precious Angelique Garcia | `GDNNA3…I3LM` | 3 | 2026-07-25T08:05:07Z | v2 | [View tx](https://stellar.expert/explorer/testnet/tx/cd7b636ae58f6a2f193c476bafc77870c0c22bbbd5f778d604f09760df413c84) |
| 37 | Myrhicka Nadine Carillaga | `GB5XF2…7FT2` | 2 | 2026-07-25T08:09:22Z | v2 | [View tx](https://stellar.expert/explorer/testnet/tx/52c2fd2181830984b0d463d2c8e5a27cf22bd3fa103646c4a50c0d1b7c030310) |
| 38 | Jonathan Piojo | `GA6WVU…235X` | 2 | 2026-07-25T08:15:18Z | v2 | [View tx](https://stellar.expert/explorer/testnet/tx/38b1bf1a0b1cff3d9b87f627a934e58aa2362622af8c52f14af2c0876165b364) |
| 39 | Kristine Rabulan | `GAHP2O…7CPE` | 4 | 2026-07-25T08:25:29Z | v2 | [View tx](https://stellar.expert/explorer/testnet/tx/b406c0efa30269bb8661fae3f6f46f4e006a851eaa7a705cbf119fb6ed94a749) |
| 40 | Angelo Casayuran | `GC7QHV…5I4H` | 6 | 2026-07-25T08:31:50Z | v2 | [View tx](https://stellar.expert/explorer/testnet/tx/8ee3345ca871cead967ec82449d18145df58e02fef1230c221798f0455537a09) |
| 41 | Xian Desquitado | `GBJ6R4…3ICE` | 3 | 2026-07-25T15:40:28Z | v2 | [View tx](https://stellar.expert/explorer/testnet/tx/f124eedc4088c09ddc3adaed7c36a7879874b0acda774ad3aa77554e37fd6615) |
| 42 | Paolo Tabal | `GA2SOJ…IKM3` | 3 | 2026-07-25T08:57:23Z | v2 | [View tx](https://stellar.expert/explorer/testnet/tx/73a73d5803c7d16084b40bdc7c7e2787bfa18ba52e73c0c5917512828b1ce664) |
| 43 | Benz Kyle Bonon | `GD6PCF…4ZF3` | 5 | 2026-07-25T09:14:55Z | v2 | [View tx](https://stellar.expert/explorer/testnet/tx/467b0b9aeabad82bb4db0b2803677d45a63799aa6030380e7495f46e34cd05c3) |
| 44 | AJ Beltran Balisi | `GBVS4Z…7MOL` | 3 | 2026-07-25T09:22:41Z | v2 | [View tx](https://stellar.expert/explorer/testnet/tx/08b9e306dbd7e0a37f8f510aa1a0a2deeeb9e13bafe337abbf6f66a8ccd9f5cb) |
| 45 | Sebastian Baes | `GAWHF7…52DB` | 4 | 2026-07-25T09:33:27Z | v2 | [View tx](https://stellar.expert/explorer/testnet/tx/70eaaeab2a145d8bad76dcff1f37ad5cd82e60b0a8a70244fd97aa13e74e09a6) |
| 46 | Nancy Ricanor | `GBYDK7…YQYM` | 3 | 2026-07-25T09:41:53Z | v2 | [View tx](https://stellar.expert/explorer/testnet/tx/7aeed0c84c52264631b2baea31871b835e5cf644db8317a258fbd9cebc4b5bcd) |
| 47 | Lancelot Abbarintos | `GAIT5U…TOXZ` | 4 | 2026-07-25T09:53:59Z | v2 | [View tx](https://stellar.expert/explorer/testnet/tx/4e3dcc8b0dd23df0a4e9ef315884c51219b431f58f2a79389c11be38d7fd1287) |
| 48 | Xander Beatingo | `GDVWGP…4PB6` | 4 | 2026-07-25T10:04:45Z | v2 | [View tx](https://stellar.expert/explorer/testnet/tx/8bb39204e7fc5e2f1dbaa88f7f8414d5738fe3741cb5b3fa50148e7b70429ff1) |
| 49 | Bryce Carmelo Velasquez | `GBQLKK…4CE2` | 2 | 2026-07-25T10:10:21Z | v2 | [View tx](https://stellar.expert/explorer/testnet/tx/879bdcdec3543085937f609a3f3c516b5e82f10f9a31d65b557212df2f9dc455) |
| 50 | Anjelo Lazaro | `GCW7C6…Y7R5` | 2 | 2026-07-25T10:16:42Z | v2 | [View tx](https://stellar.expert/explorer/testnet/tx/27d12107b8c49166ff212de6c0efd60c49c19516a34cdf951335b2177505f266) |
| 51 | Vm San Pedro | `GBCRHJ…47WI` | 2 | 2026-07-25T16:16:52Z | v2 | [View tx](https://stellar.expert/explorer/testnet/tx/04bb434486c54cf0a7617172126a69234eb1af484d8446907dfc3ec6902a8205) |

## Full Wallet Addresses

<details><summary>Click to expand all full public keys (for independent verification)</summary>

1. **Jeric Rabara** — `GAJNW53ROFPDIJOGKUP53HXOSWYN42IL2UDB4PB64MVZECCZ3JBGMZZL`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GAJNW53ROFPDIJOGKUP53HXOSWYN42IL2UDB4PB64MVZECCZ3JBGMZZL)
2. **Dianna Rose Magbanua** — `GD5TYJPVPNCEVXBQ3QISMV2KUPSNCGJWNRUKMKI6SEIWQ7JCRMNDSW5B`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GD5TYJPVPNCEVXBQ3QISMV2KUPSNCGJWNRUKMKI6SEIWQ7JCRMNDSW5B)
3. **Nhaytan** — `GBTO2FOP3AKLQTUWCWWYRDHVS3KBV4OQI654R66O45OVRXBYUED7AVYN`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GBTO2FOP3AKLQTUWCWWYRDHVS3KBV4OQI654R66O45OVRXBYUED7AVYN)
4. **GLEN** — `GAXZV6P7DZVLJU6UVF3DZDHRDQCDLBMM24X3OYOZRRLF7ZN5DIJQDNED`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GAXZV6P7DZVLJU6UVF3DZDHRDQCDLBMM24X3OYOZRRLF7ZN5DIJQDNED)
5. **Richie Christian De guzman** — `GBZZSGGSWM6FSI4AJ2TETGTNB56JRLMRVNTXS2BKCZGEBSZDSK26SGBA`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GBZZSGGSWM6FSI4AJ2TETGTNB56JRLMRVNTXS2BKCZGEBSZDSK26SGBA)
6. **Kurt Justin** — `GC6SFJXAEDPWUQHQT6MXBZ2P2MVWWPTCBLYHDMCONOSGJXISE6I3HI3F`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GC6SFJXAEDPWUQHQT6MXBZ2P2MVWWPTCBLYHDMCONOSGJXISE6I3HI3F)
7. **Dayniel Talusig** — `GAFP7WUINSSCMRZBS4POXWHGK5OFNDVAQR7M77P3QMTAPGTDVSDP43BJ`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GAFP7WUINSSCMRZBS4POXWHGK5OFNDVAQR7M77P3QMTAPGTDVSDP43BJ)
8. **Darid De Jesus** — `GC4WWONMOYVPEEQTYO3BISIO3F7ALUWHJ37M5GUSYYA2Q7MJKTUBXRE5`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GC4WWONMOYVPEEQTYO3BISIO3F7ALUWHJ37M5GUSYYA2Q7MJKTUBXRE5)
9. **Cedrick Cadence Cornejo** — `GBXUBPKOA63QJ4OZB3QM7ZJAEJKFJFSCADRSM5TAS6SBKEQUZ6EYXRYZ`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GBXUBPKOA63QJ4OZB3QM7ZJAEJKFJFSCADRSM5TAS6SBKEQUZ6EYXRYZ)
10. **Ricky Mark Mercado** — `GBV2UCM75ITDUOPFDLMSOHWBDNY7FPDFBYW3FRE5HM6LK7ZWFUV3AFUK`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GBV2UCM75ITDUOPFDLMSOHWBDNY7FPDFBYW3FRE5HM6LK7ZWFUV3AFUK)
11. **kent** — `GD4Q2HBQWR4EIENXQAQ4UIPPR3SAGMAUSD5KOSUDRVN5GMEPBYTGVCE7`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GD4Q2HBQWR4EIENXQAQ4UIPPR3SAGMAUSD5KOSUDRVN5GMEPBYTGVCE7)
12. **Lacsamana Juan Carlo** — `GAY4PAUWPKHDLZIRSRSMNIJQ3TMXRD6ULJL43AACOPMTYZ7HHHT7ZOJQ`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GAY4PAUWPKHDLZIRSRSMNIJQ3TMXRD6ULJL43AACOPMTYZ7HHHT7ZOJQ)
13. **Raymond Deguzman** — `GCN5BXQEOROX2HALUBZKJPOODPD2RHO5WZ6VVYQ2EJ7IO5XNUO6XMNN7`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GCN5BXQEOROX2HALUBZKJPOODPD2RHO5WZ6VVYQ2EJ7IO5XNUO6XMNN7)
14. **Johnrick Abad** — `GCQQDFUWE2YJWKEGQDVDA5NDXDV5NHRMQ4LQHINZTIAZPJTJITG52G6I`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GCQQDFUWE2YJWKEGQDVDA5NDXDV5NHRMQ4LQHINZTIAZPJTJITG52G6I)
15. **Alvin Joseph** — `GADVI3JBCXSG4KDR37TGEZH3PCKDIC35RL7ONNX6NKOMC5DU2B2DN4U6`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GADVI3JBCXSG4KDR37TGEZH3PCKDIC35RL7ONNX6NKOMC5DU2B2DN4U6)
16. **Arlyn Gamores** — `GAUXEY4HPHJGSZKQWTBNO6JKSFZWSOW2EQ5UY2DNHCRAJ3673C5QHK6A`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GAUXEY4HPHJGSZKQWTBNO6JKSFZWSOW2EQ5UY2DNHCRAJ3673C5QHK6A)
17. **Zurick Misola Comia** — `GBOPRN5R5TWP6SSZKVSRN3B3KG25GAW53RGZ3ACMUPPW2HAOKWCZOVUF`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GBOPRN5R5TWP6SSZKVSRN3B3KG25GAW53RGZ3ACMUPPW2HAOKWCZOVUF)
18. **Ethel Verana** — `GBAKAGBJU3AGHSXYTR4XKT7FTCLZN23LJEUGDWMBPOBHZG67WY2XCMDZ`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GBAKAGBJU3AGHSXYTR4XKT7FTCLZN23LJEUGDWMBPOBHZG67WY2XCMDZ)
19. **Raymond Caseria** — `GDG3DXU4DO37ZCNFTNBBEWMH4HQ3HXZAOC4SHSAO7B7I2UOHVPSP52XY`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GDG3DXU4DO37ZCNFTNBBEWMH4HQ3HXZAOC4SHSAO7B7I2UOHVPSP52XY)
20. **Jian Daniel Desquitado** — `GA3JPWXSU5DQEZWR6E6UDW6VVKJ3AP67L32F42HL2S2UK6M5UPASVANX`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GA3JPWXSU5DQEZWR6E6UDW6VVKJ3AP67L32F42HL2S2UK6M5UPASVANX)
21. **Ezekielle Liwanag Gambong** — `GBKONGQ5Z5SGK4XWOIQKZQBSKSFUR2P5BH6US75CETV3YHZYM4JU5ACQ`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GBKONGQ5Z5SGK4XWOIQKZQBSKSFUR2P5BH6US75CETV3YHZYM4JU5ACQ)
22. **Mely Valenzuela** — `GAKHHDMRFTLWZDEI3RPP24ZH7VAH6LQBSDHC7UVZV677AHJZ7UDINCCI`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GAKHHDMRFTLWZDEI3RPP24ZH7VAH6LQBSDHC7UVZV677AHJZ7UDINCCI)
23. **Regina Reg** — `GCEWJI4GT6Y67SCZCY2TJOBRWA5EAOZOCHEPKHVF577KCKPAE3RA523C`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GCEWJI4GT6Y67SCZCY2TJOBRWA5EAOZOCHEPKHVF577KCKPAE3RA523C)
24. **Ethel Verana** — `GCBX5TCNUDKTHWBUQ7FMOYSESMOCZEGJ6MR55UVFSHAM43RIBYZHKBQM`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GCBX5TCNUDKTHWBUQ7FMOYSESMOCZEGJ6MR55UVFSHAM43RIBYZHKBQM)
25. **Paul Anthony Abalon** — `GCDIDG7BFVLSUEFQXEA5NQ5VN3U5SZ2U4OHMKS6GYIX7OKDVPJDRN2JX`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GCDIDG7BFVLSUEFQXEA5NQ5VN3U5SZ2U4OHMKS6GYIX7OKDVPJDRN2JX)
26. **Heart Leonardo** — `GDFSBIXYVP5H4CHIU5WBDLJLXHEJJX7QPYX5RFS7QS25BKCOUFMVQ5RX`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GDFSBIXYVP5H4CHIU5WBDLJLXHEJJX7QPYX5RFS7QS25BKCOUFMVQ5RX)
27. **Justine Guiaz** — `GCRU4DECK3L3QZEQJDZPNAREL2BKCUKD5CJPT5YAC5P6K2HCPQ62RBKT`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GCRU4DECK3L3QZEQJDZPNAREL2BKCUKD5CJPT5YAC5P6K2HCPQ62RBKT)
28. **Karla Christine Malonzo** — `GDYZDMVYVDGK3JLFWETODIMVITMNUQL7RAPZQ7EZIXJIGTY3652LK7IY`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GDYZDMVYVDGK3JLFWETODIMVITMNUQL7RAPZQ7EZIXJIGTY3652LK7IY)
29. **Ronan Ivan Cardama** — `GAFQ5C2C2Y7S2K2CU34OUJOJYFHU3TFLANQIAARRTMZEFNILLJITTQRL`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GAFQ5C2C2Y7S2K2CU34OUJOJYFHU3TFLANQIAARRTMZEFNILLJITTQRL)
30. **Rujane Rafanan** — `GBXP7EO2EDRTK6OZQ45JFP4FCJK4VW27J7A776SKGMUQBAZLJGVY2DBA`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GBXP7EO2EDRTK6OZQ45JFP4FCJK4VW27J7A776SKGMUQBAZLJGVY2DBA)
31. **Jenald Aldrin Rojas** — `GAERS4FCFV3ZBMSOUTEVP4LDHG36A2D35YTHOSNNMV7QIL2L2XI5HVOB`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GAERS4FCFV3ZBMSOUTEVP4LDHG36A2D35YTHOSNNMV7QIL2L2XI5HVOB)
32. **Kurt Joshua Cayaga** — `GDMKLNAPPSD3FY5HTXLVOAVWEXUMPH2246WDS7NEMFQ5NFTCNOMK3R5Y`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GDMKLNAPPSD3FY5HTXLVOAVWEXUMPH2246WDS7NEMFQ5NFTCNOMK3R5Y)
33. **Clarette Consulta** — `GAKA3I5QBHBRDMB4TNQJ4VWFCPRSBGXPOYN6G7Z6XKEDLM3NWDYCEJ2F`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GAKA3I5QBHBRDMB4TNQJ4VWFCPRSBGXPOYN6G7Z6XKEDLM3NWDYCEJ2F)
34. **Jodessa** — `GBEAYWKAZ2RNZK7466QDFPAUXEM4XZC2JVWT532VTYIRLQLUFWNES43W`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GBEAYWKAZ2RNZK7466QDFPAUXEM4XZC2JVWT532VTYIRLQLUFWNES43W)
35. **Janssen Guinto** — `GAHP43IYSV2VI7EUZWTBCQLAGNDKQRE5PZTAC3VD5ZEGFHLDISPRJTXZ`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GAHP43IYSV2VI7EUZWTBCQLAGNDKQRE5PZTAC3VD5ZEGFHLDISPRJTXZ)
36. **Precious Angelique Garcia** — `GDNNA3IZZO4QJJA5ITJ7N74WLZT5J2FQDLT62VYOLOMDWG3YCF7AI3LM`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GDNNA3IZZO4QJJA5ITJ7N74WLZT5J2FQDLT62VYOLOMDWG3YCF7AI3LM)
37. **Myrhicka Nadine Carillaga** — `GB5XF2GEH246UHDF2YPLF6GYC22XDRVJNHWRIO5HXJ26UX23A4KQ7FT2`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GB5XF2GEH246UHDF2YPLF6GYC22XDRVJNHWRIO5HXJ26UX23A4KQ7FT2)
38. **Jonathan Piojo** — `GA6WVUI76VFDSSXPQ7IF6IZJDSLH6QAXKEISSXY2JSNCYQ4UFXFN235X`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GA6WVUI76VFDSSXPQ7IF6IZJDSLH6QAXKEISSXY2JSNCYQ4UFXFN235X)
39. **Kristine Rabulan** — `GAHP2OWCLOKTG77K2U4IY7RFVAQDTQ647HBCHCI73KWQE4VYYAT67CPE`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GAHP2OWCLOKTG77K2U4IY7RFVAQDTQ647HBCHCI73KWQE4VYYAT67CPE)
40. **Angelo Casayuran** — `GC7QHVJRNKWZU35PCACYNHFNE2ZEBDF5MBKI6DYU7FHPTP5X7SPB5I4H`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GC7QHVJRNKWZU35PCACYNHFNE2ZEBDF5MBKI6DYU7FHPTP5X7SPB5I4H)
41. **Xian Desquitado** — `GBJ6R4RIIQC34NXWLKA75P4F3RYU7W23CC6SGIZNH6JNBLLLUICZ3ICE`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GBJ6R4RIIQC34NXWLKA75P4F3RYU7W23CC6SGIZNH6JNBLLLUICZ3ICE)
42. **Paolo Tabal** — `GA2SOJ44O7SJWVZBVVWXETRMXL43QAFBUITCBPDYZRGI6V6BU4VPIKM3`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GA2SOJ44O7SJWVZBVVWXETRMXL43QAFBUITCBPDYZRGI6V6BU4VPIKM3)
43. **Benz Kyle Bonon** — `GD6PCFX6SFCJ3DT36REOZEQBACJLOGCFO4F3UB3OZOFO7RD72CXR4ZF3`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GD6PCFX6SFCJ3DT36REOZEQBACJLOGCFO4F3UB3OZOFO7RD72CXR4ZF3)
44. **AJ Beltran Balisi** — `GBVS4Z7FLFEDHDDKD5SHMRP2NZXKW7PNO7IJXCFJYVGODRGPMB5V7MOL`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GBVS4Z7FLFEDHDDKD5SHMRP2NZXKW7PNO7IJXCFJYVGODRGPMB5V7MOL)
45. **Sebastian Baes** — `GAWHF7KR5JMLH7IIPW4X6L64ZOSEDRZ33JMONT7GDZ7BNMQGOAP552DB`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GAWHF7KR5JMLH7IIPW4X6L64ZOSEDRZ33JMONT7GDZ7BNMQGOAP552DB)
46. **Nancy Ricanor** — `GBYDK7INAZHUN2KSI6MYHQ7X7DKIUORGUH34TD6ZSUVABUGCINWAYQYM`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GBYDK7INAZHUN2KSI6MYHQ7X7DKIUORGUH34TD6ZSUVABUGCINWAYQYM)
47. **Lancelot Abbarintos** — `GAIT5U65RT76PTMCOBJNAQGKGP365P53AJKORQU6N6GQ3L5ZSHSGTOXZ`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GAIT5U65RT76PTMCOBJNAQGKGP365P53AJKORQU6N6GQ3L5ZSHSGTOXZ)
48. **Xander Beatingo** — `GDVWGPY2T3NUHQ4LFPL5JK756NGYNGRNZY5WNPSTM42WQSUVCMVQ4PB6`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GDVWGPY2T3NUHQ4LFPL5JK756NGYNGRNZY5WNPSTM42WQSUVCMVQ4PB6)
49. **Bryce Carmelo Velasquez** — `GBQLKKCFW7R4YCSDTPR43BXWPYTQH2P22DOCBIDIB7TL6ISTNERW4CE2`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GBQLKKCFW7R4YCSDTPR43BXWPYTQH2P22DOCBIDIB7TL6ISTNERW4CE2)
50. **Anjelo Lazaro** — `GCW7C6VYTN3GQ2OXSJABDGJM46PYY6KAEILAAZ7GQGQV7CYACSMUY7R5`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GCW7C6VYTN3GQ2OXSJABDGJM46PYY6KAEILAAZ7GQGQV7CYACSMUY7R5)
51. **Vm San Pedro** — `GBCRHJT2MQYXGMZW7VJ2QOJGE2KFUVI63HUBKXH4DGBBD3HZAKVJ47WI`  
   [Account on Stellar Expert](https://stellar.expert/explorer/testnet/account/GBCRHJT2MQYXGMZW7VJ2QOJGE2KFUVI63HUBKXH4DGBBD3HZAKVJ47WI)

</details>

## Data Hygiene Notes

- All wallet addresses are validated 56-character Stellar public keys (strkey `G...`).
- **1 wallet address(es) were submitted by more than one form respondent** and are counted **once** (as a single distinct user), never double-counted:
  - `GBJ6R4…3ICE` — submitted by: 'Xian Desquitado', 'Kym Baculanta'. Counted as one distinct user (the first respondent).
- After de-duplication, 52 form responses map to **51 distinct on-chain-verified users**.
- Transactions span 2026-07-12 through 2026-07-26; many wallets show 2–12 submissions each, indicating genuine repeat play rather than one-and-done activity.
