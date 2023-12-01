/* eslint-disable */

import { collection } from "./blockchain";

export const balanceOf = async (address, addressCollection: string) => {
    const balance = await collection(addressCollection).then((res) => res.balanceOf(address));
    return balance;
}

export const getApproved = async (tokenId, addressCollection: string) => {
    const approved = await collection(addressCollection).then((res) => res.getApproved(tokenId));
    return approved;
}

export const getTotal = async (addressCollection: string) => {
    const total = await collection(addressCollection).then((res) => res.getTotal());
    return total;
}

export const isApproveForAll = async (owner, operator, addressCollection) => {
    const approved = await collection(addressCollection).then((res) => res.isApprovedForAll(owner, operator));
    return approved;
}

export const name = async (addressCollection) => {
    const name = await collection(addressCollection).then((res) => res.name());
    return name;
}

export const owner = async (addressCollection) => {
    const owner = await collection(addressCollection).then((res) => res.owner());
    return owner;
}

export const ownerOf = async (tokenId, addressCollection) => {
    const owner = await collection(addressCollection).then((res) => res.ownerOf(tokenId));
    return owner;
}

export const symbol = async (addressCollection) => {
    const symbol = await collection(addressCollection).then((res) => res.symbol());
    return symbol;
}

export const tokenURI = async (tokenId, addressCollection) => {
    const uri = await collection(addressCollection).then((res) => res.tokenURI(tokenId));
    return uri;
}