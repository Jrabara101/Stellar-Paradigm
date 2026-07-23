# Soroban Project

## Project Structure

This repository uses the recommended structure for a Soroban project:

```text
.
├── contracts
│   ├── leaderboard-contract    # WordScramble leaderboard + score submission
│   │   ├── src
│   │   │   └── lib.rs
│   │   └── Cargo.toml
│   └── reward-contract         # Badge minting, called cross-contract from leaderboard-contract
│       ├── src
│       │   └── lib.rs
│       └── Cargo.toml
├── Cargo.toml
└── README.md
```

- New Soroban contracts can be put in `contracts`, each in their own directory.
- Contracts should have their own `Cargo.toml` files that rely on the top-level `Cargo.toml` workspace for their dependencies.
- Frontend libraries can be added to the top-level directory as well. If you initialized this project with a frontend template via `--frontend-template` you will have those files already included.
