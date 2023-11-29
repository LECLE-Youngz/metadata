/* eslint-disable */

import { collection } from ".";

export const balanceOf = async (address) => {
    const balance = await collection().then((res) => res.balanceOf(address));
    return balance;
}

export const getApproved = async (tokenId) => {
    const approved = await collection().then((res) => res.getApproved(tokenId));
    return approved;
}

export const getTotal = async () => {
    const total = await collection().then((res) => res.getTotal());
    return total;
}

export const isApproveForAll = async (owner, operator) => {
    const approved = await collection().then((res) => res.isApprovedForAll(owner, operator));
    return approved;
}

export const name = async () => {
    const name = await collection().then((res) => res.name());
    return name;
}

export const owner = async () => {
    const owner = await collection().then((res) => res.owner());
    return owner;
}

export const ownerOf = async (tokenId) => {
    const owner = await collection().then((res) => res.ownerOf(tokenId));
    return owner;
}

export const symbol = async () => {
    const symbol = await collection().then((res) => res.symbol());
    return symbol;
}

export const tokenURI = async (tokenId) => {
    const uri = await collection().then((res) => res.tokenURI(tokenId));
    return uri;
}