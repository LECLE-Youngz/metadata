import { mysteryCollection } from "./blockchain";

export const nftPurchasedRequired = async (addressCollection: string) => {
    const numNFT = await mysteryCollection(addressCollection).then((res) => res.nftPurchasedRequired());
    return numNFT;
}

export const mysteryEvMax = async (addressCollection: string) => {
    const max = await mysteryCollection(addressCollection).then((res) => res.i_maxSupply());
    return max;
}