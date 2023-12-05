import { generative } from "./blockchain";

export const ownerCollection = async (address) => {
    const contract = await generative(address);
    const res = await contract.owner();
    return res;
};