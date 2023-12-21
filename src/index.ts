import {
  Canister,
  Err,
  None,
  Ok,
  Principal,
  Record,
  Result,
  Some,
  StableBTreeMap,
  Vec,
  ic,
  query,
  text,
  update,
} from "azle";

import {
  HttpResponse,
  HttpTransformArgs,
  managementCanister,
} from "azle/canisters/management";

// Define a record for a nft with just the name and symbol
const Nft = Record({
  name: text,
  symbol: text,
});

// Define a record for user's favorite nfts
const UserFavorites = Record({
  id: Principal,
  favorites: Vec(Nft),
});

// Define a simple storage structure for user favorites
const userFavoritesStorage = StableBTreeMap(Principal, UserFavorites, 1);

/**
 * Defines a Canister object with three methods:
 * - getNftPrice: get current data (name, price_floor, volume_24h ...) for an NFT collection using the CoinGecko API.
 * - saveFavoriteNft: saves a given Nft as a favorite for the current user.
 * - removeFavoriteNft: removes Nft as a favorite for the current user.
 * - getFavoriteNfts: retrieves the list of favorite nfts for the current user.
 */
export default Canister({
  getNftPrice: update([text], Result(text, text), async (nftId) => {
    const nft = nftId.toLowerCase();

    const response = await ic.call(managementCanister.http_request, {
      args: [
        {
          url: `https://api.coingecko.com/api/v3/nfts/${nft}`,
          max_response_bytes: Some(5_000n),
          method: {
            get: null,
          },
          headers: [],
          body: None,
          transform: Some({
            function: [ic.id(), "transformHttpResponse"] as [Principal, string],
            context: Uint8Array.from([]),
          }),
        },
      ],
      cycles: 90_000_000n,
    });

    if (Number(response.status) !== 200) {
      return Err("Failed to get coin price");
    }

    var body = JSON.parse(new TextDecoder().decode(response.body));

    if (!body["floor_price"]) {
      return Err("Nft not found");
    }

    const price = body["floor_price"]["usd"];
    return Ok(`The price of ${nft} is $ ${price}`);
  }),

  saveFavoriteNft: update([Nft], Result(text, text), (nft) => {
    const userId = ic.caller();

    const entry = {
      id: userId,
      favorites: [nft],
    };

    if (userFavoritesStorage.containsKey(userId) === false) {
      userFavoritesStorage.insert(userId, entry);
    } else {
      const favorites = userFavoritesStorage.get(userId);
      entry.favorites = [...favorites.Some.favorites, nft];
      userFavoritesStorage.insert(userId, entry);
    }

    return Ok(`Nft ${nft.name} added to favorites`);
  }),
  removeFavoriteNft: update([text], Result(text, text), (nftSymbol) => {
    const userId = ic.caller();

    if (userFavoritesStorage.containsKey(userId) === false) {
      return Err("No favorites found");
    }

    const nfts = userFavoritesStorage.get(userId).Some.favorites;

    const nft: typeof Nft = nfts.find(
      (nft: typeof Nft) => nft.symbol === nftSymbol
    );

    if (!nft) {
      return Err("Nft not found");
    }

    const favorites = nfts.filter(
      (nft: typeof Nft) => nft.symbol !== nftSymbol
    );

    const entry = {
      id: userId,
      favorites: favorites,
    };

    userFavoritesStorage.insert(userId, entry);

    return Ok(`Nft ${nft.name} removed from favorites`);
  }),

  getFavoriteNfts: query([], Result(Vec(Nft), text), () => {
    const userId = ic.caller();

    if (userFavoritesStorage.containsKey(userId) === false) {
      return Err("No favorites found");
    }

    const favorites = userFavoritesStorage.get(userId);

    return favorites ? Ok(favorites.Some.favorites) : Err("No favorites found");
  }),
  transformHttpResponse: query([HttpTransformArgs], HttpResponse, (args) => {
    return {
      ...args.response,
      headers: [],
    };
  }),
});
