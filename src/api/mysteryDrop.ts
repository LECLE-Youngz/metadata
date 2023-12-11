import { mysteryDropCollection } from "./blockchain";

export const nftPurchasedRequired = async (addressCollection: string) => {
    const numNFT = await mysteryDropCollection(addressCollection).then((res) => {
        return res.nftPurchasedRequired
    })
    return numNFT;
}
export const mysteryDropEvMax = async (addressCollection: string) => {
    const max = await mysteryDropCollection(addressCollection).then((res) => res.i_maxSupply);
    return max;
}