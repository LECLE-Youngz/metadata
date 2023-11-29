/* eslint-disable */

import { factory } from "./blockchain";

export const getTotalCollection = async () => {
    const total = await factory().then((res) => res.getTotalCollection());
    return total;
}

export const indexToContract = async (index) => {
    const contract = await factory().then((res) => res.indexToContract(index));
    return contract;
}

export const indexToOwner = async (index) => {
    const owner = await factory().then((res) => res.indexToOwner(index));
    return owner;
}

export const tokens = async (index) => {
    const token = await factory().then((res) => res.tokens(index));
    return token;
}