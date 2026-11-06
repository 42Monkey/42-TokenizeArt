# 42 Advanced Core - TokenizeArt

<p align="center">
  <img src="https://violet-recent-capybara-836.mypinata.cloud/ipfs/bafybeibwlqewa2w6uk7waknc4wtjc4r5nvsqwo6eillgkkfxcjprweco6y" alt="TokenizeArt Demo Image" width="500" />
</p>

## Description

TokenizeArt is an ERC-721 non-fungible token built for the 42 Advanced Core curriculum.

It follows the OpenZeppelin standard for digital ownership, features metadata storage via IPFS, and includes scripts written in TypeScript for compiling, deploying, minting and inspecting on-chain smart contracts.

## Project Structure

```
TokenizeArt/
├── code/
│   └── TokenizeArt.sol      # ERC-721 smart contract
├── deployment/
│   ├── deploy.ts            # script to deploy contract to Sepolia/Local
│   └── check.ts             # script to inspect on-chain state & IPFS metadata
├── documentation/
│   └── whitepaper.md        # technical architecture, design choices
├── mint/
│   └── mint.ts              # script for minting new tokens
├── hardhat.config.ts        # Hardhat network configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Project dependencies and npm script shortcuts
├── .env.example
└── .gitignore
```

## Choices

- **NodeJS (22) + TypeScript** for deployment scripts and managing development dependencies.
- **Solidity (0.8.24)** chosen for its built-in safety-features and EVM compatibility.
- **OpenZeppelin Contracts** to use tested and community-audited ERC-721 standards.
- **Hardhat** as the development framework for compiling and deploying contracts locally and on-chain in TypeScript.
- **IPFS (via Pinata)** for storing media assets and JSON metadata objects, rather than centralized servers or costly on-chain storage.
- **Ethereum Sepolia Testnet** as the public test network used to host the live contract safely and for free.
- **Ethereum** chosen over the BNB testnet for its tools, Etherscan verification and ERC-721 references.

## Documentation

- [Technical Whitepaper](./documentation/whitepaper.md)

