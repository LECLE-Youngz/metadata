import { mysteryCollection } from "./blockchain";

export const nftPurchasedRequired = async (addressCollection: string) => {
    const res = await mysteryCollection(addressCollection);
    const numNFT = res.nftPurchasedRequired();
    return numNFT;
};

export const mysteryEvMax = async (addressCollection: string) => {
    const max = await mysteryCollection(addressCollection).then((res) => res.i_maxSupply);
    return max;
}