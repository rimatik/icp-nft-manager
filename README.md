# icp-nft-manager

This project is a canister that leverages the Internet Computer Protocol (ICP) and the Azle framework. It is designed to interact with the CoinGecko API for fetching real-time nft prices and enables users to manage a watchlist of their favorite nfts.

## Key Components

- **Nft**: Records the essential details of a nft, such as its name and symbol.
- **UserFavorites**: Associates a user's unique Principal identifier with their list of favorite nfts.
- **userFavoritesStorage**: Utilizes `StableBTreeMap` for stable storage, ensuring persistence of user favorites across system updates.

## Features

- **getNftPrice**: Retrieves the current price of a specified nft in USD from the CoinGecko API.
- **saveFavoriteNft**: Allows a user to add a nft to their favorites list.
- **removeFavoriteNft**: Permits a user to remove a nft from their favorites list.
- **getFavoriteNfts**: Fetches the list of a user's favorite nfts.

## Interaction

Users can interact with the canister via its public methods. The application supports both reading and writing operations, enabling users to update their watchlist and access up-to-date pricing information.

## External HTTP Requests

The canister makes use of `managementCanister.http_request` to execute outbound HTTP requests to the CoinGecko API.

## Purpose

The provided code snippet serves an educational purpose, demonstrating how to build a canister on the ICP using the Azle framework.

## How to run the project

- Clone the repository

```bash
git clone https://github.com/rimatik/icp-nft-manager.git
```

- Install dependencies

```bash
npm install
```

- Start DFX (More about the flags can be found [here](https://internetcomputer.org/docs/current/references/cli-reference/dfx-start#flags))

```bash
dfx start --background --clean
```

- Deploy canister

```bash
dfx deploy
```

Once the command completes, you should see a message indicating the successful deployment of your canisters. The output will include URLs for interacting with your backend canister through the Candid interface.

Example:

```bash
Deployed canisters.
URLs:
  Backend canister via Candid interface:
    nft_manager: http://127.0.0.1:4943/?canisterId=ce2us-64aaa-aaa2a-qabbq-aai&id=bd3sg-teava-aaaaa-qaaba-cai
```

- Stop DFX when done

```bash
dfx stop
```

# Use cases

Use cases can be done through the **Candid interface** or using the command line with the commands below.

## Get coin price by calling CoinGecko API

```bash
dfx canister call nft_manager getNftPrice '(squiggly)'
```

You will get a message (will be different because of the nft price):

```rust
(variant { Ok = "The nft of crypto punk is $100" })
```

## Add coin to favorites

```bash
dfx canister call nft_manager saveFavoriteNft '(record {"name"="Crypto punk"; "symbol"="PUNK";})'
```

You will get a message:

```rust
(variant { Ok = "Nft Crypto punk added to favorites" })
```

## Get all favorites

```bash
dfx canister call nft_manager getFavoriteNfts
```

You will get a message:

```rust
(variant { Ok = vec { record { name = "Crypto punk"; symbol = "PUNK" } } })
```

## Remove coin from favorites

```bash
dfx canister call nft_manager removeFavoriteNft '(squiggly)'
```

You will get a message:

```rust
(variant { Ok = "Nft crypto punk removed from favorites" })
```
