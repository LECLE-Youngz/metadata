import { mysteryDropCollection } from "./blockchain";

export const mysteryDropEvMax = async (addressCollection: string) => {
    const max = await mysteryDropCollection(addressCollection).then((res) => res.i_maxSupply);
    return max;
}