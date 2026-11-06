# TokenizeArt : Technical Whitepaper

## Overview

TokenizeArt is an ERC-721 non-fungible token. Each token represents one piece of digital art with the number 42 and signed with `42Monkey`.

The token is not the image itself. On-chain, the contract records who owns the token and a pointer (`ipfs://...`) to a JSON metadata file.

That file, and the image it references, are stored on IPFS and pinned through [Pinata](https://pinata.cloud/).

- **Solidity contract**: `TokenizeArt`
- **Name / Symbol**: `Monkey` / `MKY42`
- **Standard**: ERC-721 (OpenZeppelin `ERC721URIStorage` + `Ownable`)
- **Network**: Ethereum Sepolia Testnet
- **Contract address**: `0x7aa604624dEAC7985699F8242361a8D3C14c7bAB`
- **Token ID**: `1`
- **Owner wallet**: `0x0d4600802b301d65F0998a0D2B95948bA24FF1B3`
- **Etherscan**: https://sepolia.etherscan.io/address/0x7aa604624dEAC7985699F8242361a8D3C14c7bAB

---

## Architecture

![](https://mermaid.ink/img/pako:eNptVF1v2jAU_SuWp0qtBAFCSBNrrdQS2iIVqaJ0k0b64CYmeE3syHYGlPLfd51AW7H5xR8659xz77W9xYlMGSZ4kctVsqTKoPtpLBCMkxM0W7KCtWkmpDY8Qdpsci4ytJAK3XJzV72ge54tTSei6hUVIKQbapJTrSO2QClb0Co3aMHznBhFhS6pYsK0tFHylbVXPDVL4pbrI96K5jkzqEGRbzeDcNS9PsIkUoBi8okKrgfDG_8IJZhZSXB3APW612HQOwLB9CVad3Q1GIUHiynVUBZFNwR5yItFQ33STJ3Oh4pRA8X4Wdv9_qIuH1kpc07RaHb3fEYIaRJpOKMfk-12BpqCv7ErZRwt85pT2LIP9-nsdkA75HYIp6uXTNFyicYPN49oHrGEWUAOQil6BAs0Y88N1I4HLqih89Nmbki31LAV3Zw9g_y-KJ-ECTM0tZROsV85v7UU1l1tGD1Nxx3LrCv1yYMs5p2IZ9zQ3G4sYVyAGTQcR_8jHHtEbad9-T5lUIo_TL9_GPnXWoO0VaJcABKiNSAm0q9dQRcXKMY9B024MGi2Rqe3VJ_FGM4vbQs-etEAXQDSEjVZjiNkpM11D2884hbOFE8xXOCKtXDBVEHtFm-tVoyNfSUxJrBULK3WcGXUazuRuVQxjsUO-CUVv6QsDhJKVtkSkwXNNeyqEvJjEafQ4uLjFJ5JytRQVsJg0u_6tQgmW7zGJAgc_9zze_1w4Pp9_9xt4Q0moec7Xr_vBsHg3HN7QbBr4bc6atcJuq7nD_zQ93oeLMIWZimHezNpXn_9Cez-ApfbStY?type=png)

The contract never talks to IPFS. It only stores the URI string.

Wallets, marketplaces and `check.ts` script read `tokenURI(id)` from the chain, then fetch the JSON and the image from an IPFS gateway themselves.

---

## Token standard (ERC-721)

The contract inherits the standard functions from OpenZeppelin, so it works with any ERC-721 wallet or tool.

- **ownerOf(tokenId)**: returns the wallet that owns the token. To prove ownership.
- **balanceOf(address)**: returns how many tokens from this contract an address holds.
- **tokenURI(tokenId)**: returns the `ipfs://` pointer to the token's metadata.
- **transferFrom** / **safeTransferFrom**: moves a token to another address (caller must be owner or approved).
- **approve** / **getApproved**: lets one address transfer one specific token.
- **setApprovalForAll** / **isApprovedForAll**: lets an operator manage all of an owner's tokens.
- **supportsInterface(0x80ac58cd)**: returns `true` for ERC-721, lets tools detect the standard.
- **name()** / **symbol()**: Collection name (`Monkey`) and ticker (`MKY42`).

---

## Smart Contract

- [TokenizeArt Smart Contract](../code/TokenizeArt.sol)

### `constructor()`

- Sets the collection name and symbol.
- Makes the deploying wallet the contract owner (`Ownable(msg.sender)`).

### `mintNFT(address recipient, string uri) returns (uint256)`

- Restricted by `onlyOwner`, any other caller reverts.
- Increments a private counter, so the first token has ID `1`.
- Calls `_safeMint(recipient, newItemId)` to create the token. If the recipient is a contract, it checks that it can receive ERC-721 tokens.
- Calls `_setTokenURI(newItemId, uri)` to attach the metadata pointer.
- Returns the new token ID.

### Access control

- **Contract owner** deploys the wallet and mints new tokens with `mintNFT`.
- **Token owner**  is the wallet shown by `ownerOf(id)`, transfers or approves that token.

These are two different roles. Just happen to be the same wallet in this project because the token was minted to the deployer.

---

## Metadata

```json
{
  "name": "42 TokenizeArt",
  "description": "Portrait of a cool monkey.",
  "image": "ipfs://bafybeibwlqewa2w6uk7waknc4wtjc4r5nvsqwo6eillgkkfxcjprweco6y",
  "attributes": [
    {
      "trait_type": "42 Cadet",
      "value": "42Monkey"
    }
  ]
}

```

- **IPFS Image CID**: `bafybeibwlqewa2w6uk7waknc4wtjc4r5nvsqwo6eillgkkfxcjprweco6y`
- **IPFS Metadata CID**: `bafkreietv26fwj7cvshszf5amddd4bipifzmijeh3vtxscdpsdoyrwoyte`

---

## Storage

Images are too expensive to keep on-chain, so they live on IPFS, where a file is addressed by the hash of its content, the `CID`.

1. The image is uploaded to IPFS and receives an image CID.
2. That CID is written into `metadata.json` as `ipfs://<image CID>`
3. `metadata.json` is uploaded and receives the metadata CID, which becomes the token URI.
4. Both files are pinned on Pinata, which keeps serving them. Without a pin, content may disappear if no node keeps a copy.

Because CID is derived from the content, the metadata and image cannot be changed after minting.

Changing either produces a different CID and would need a new token URI.

---

## Guide

### Prerequisites

- Node.js (v22+)
- A Web3 Wallet (ex: Metamask) holding Sepolia Testnet ETH.
- Free testnet ETH can be acquired from [Sepolia PoW Faucet](https://sepolia-faucet.pk910.de/#/) or [Google Ethereum Sepolia Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
- A free Etherscan API key to verify the smart contract source code.

### Execution

```bash
PRIVATE_KEY="your_wallet_private_key"
ETHERSCAN_API_KEY="your_etherscan_api_key"
CONTRACT_ADDRESS="your_smart_contract_address"
METADATA_URI="ipfs://your_metadata_cid"
```

```bash
# install dependencies
npm install

# compile the smart contract
npm run compile

# deploy the contract to the Sepolia network
npm run deploy

# copy the smart contract address in .env
# CONTRACT_ADDRESS="your_smart_contract_address"

# verify source code on Etherscan
npm run verify

# mint
npm run mint

# check
npm run check
```

### Deployment

Once the smart contract is deployed, its source code must be verified on Etherscan.

This is a recommended step to prove to the public that the compiled EVM bytecode living on the blockchain matches the original Solidity source code.

### Minting

Minting is the process of creating a new, unique token on the blockchain.

It permanently binds a new Token ID to an owner's wallet address and stores its metadata pointer (`tokenURI`) on-chain.

Crucially, only the ownership record and the pointer are permanent blockchain assets. The actual image and JSON files remain off-chain on IPFS and depend on active pinning to stay accessible.

Only the contract owner can mint and each run creates a new token, so mint once for a single-token collection.

### Check

The script only reads data, so it costs no gas.

It prints `name`, `symbol`, the contract `owner`, `ownerOf(tokenId)` (proof of who owns the NFT), `balanceOf`, `tokenURI`, approvals and ERC-721 support.

It then fetches the metadata JSON (title and login) and prints a direct image link.

## Local Development (no ETH needed)

You can run the entire pipeline locally using Hardhat's built-in EVM network.

```bash
# Terminal 1 : start local node
npx hardhat node

# .env : copy the private key from Account #0
PRIVATE_KEY="account0_private_key"

# Terminal 2 : local deploy
npx hardhat run deployment/deploy.ts --network localhost

# .env : copy the smart contract address
CONTRACT_ADDRESS="local_smart_contract_address"

# Terminal 2 : local mint
npx hardhat run mint/mint.ts --network localhost

# Terminal 2 : local check
npx hardhat run deployment/check.ts --network localhost

```

---

## Security

- **Access control:** OpenZeppelin's `Ownable` and `onlyOwner` restrict `mintNFT` to the deploying wallet, so no other address can create tokens.
- **Environment:** private keys and RPC endpoints are loaded with `dotenv` and excluded via `.gitignore`.
- **Testnet only:** the contract is deployed on Sepolia and the tokens have no financial value.
- **Defensive scripts:** they check for a missing contract at the address, a wrong URI and missing variables instead of reporting a false success.
- **Standards:** the token follows the ERC-721 specification, and the token logic comes from OpenZeppelin rather than custom code.

## Links

- [OpenZeppelin Docs - ERC-721](https://docs.openzeppelin.com/contracts/5.x/erc721)
- [Hardhat Docs](https://hardhat.org/docs/getting-started)
- [IPFS (InterPlanetary File System)](https://ipfs.tech/)
- [Sepolia Etherscan](https://sepolia.etherscan.io/)
- [Sepolia PoW Faucet](https://sepolia-faucet.pk910.de/#/)
- [Google Cloud Web3 Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
- [Architecture Diagram with MermaidJS](https://mermaid.live/edit#pako:eNptVPFP4jAY_VeaXkw0gTHGNkdzmihDJZHEKN4lx_yhbmX07FrSdgeI_O_3bQMx3PWXtst773vva7sNTlXGMMEzoZbpnGqL7h8TiWCcnKDJnBWsTXOpjOUpMnYtuMzRTGl0y-1d-YrueT63nZjqN1SAkGmoqaDGxGyGMjajpbBoxoUgVlNpFlQzaVvGavXG2kue2TnxFqsj3pIKwSxqUOTbTdAfutdHmFRJUEwPqOg6GNyERyjJ7FKBuz2o6173o-4RCKYv1dzhVTDs7y1m1EBbNF0T5CM_kQ312TB9Oh1oRi0042dt9_urvnxiCyU4RcPJ3csZIaQJ0nCGP8abzQQ0JX9nV9o6RomaU1RtH-zibLdA22fblzPla67pYo5GDzdPaBqzlFUAAUIZegILNGcvDbQaD1xSS6enzdyQbqllS7o-ewH5XVMOhDGzNKsonWK3cn4bJSt3tWH0_DjqVMy6UwcepJh2Yp5zS0W1qQijAsygwSj-H-HYI2o77cuPRwat-MPMx6eRf601yKpLlEtAQrUGxGT29VTQxQVKcNdBYy4tmqzQ6S01ZwmG75fVEXyeRQP0AEgXqEk5ipFVVdYdvPGIWzjXPMNwgUvWwgXTBa22eFNpJdhWryTBBJaaZeUKrox-a6dKKJ3gRG6Bv6Dyl1LFXkKrMp9jMqPCwK5cQD4WcwpHfIBALKYHqpQWk6BWwGSDV5hEkROe-2G31w-8sBeeey28xqTvh47f63lRFJz7XjeKti38Xpd0ncj1_DAIg27PdSPfAzWWcbg04-bp13-A7V--ykoT)
- [Pinata Storage and IPFS Pinning](https://pinata.cloud/)
