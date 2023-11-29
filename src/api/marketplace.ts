/* eslint-disable */


import { marketplace } from "./blockchain";

export const getChainlinkDataFeedLatestAnswer = async () => {
    const price = await marketplace().then((res) => res.getChainlinkDataFeedLatestAnswer());
    return price;
}

export const getListPromptBuyers = async (nftAddress, tokenId) => {
    const buyers = await marketplace().then((res) => res.getListPromptBuyers(nftAddress, tokenId));
    return buyers;
}

export const getListing = async (nftAddress, tokenId) => {
    const listing = await marketplace().then((res) => res.getListing(nftAddress, tokenId));
    return listing;
}

export const getPromptPrice = async (nftAddress, tokenId) => {
    const price = await marketplace().then((res) => res.getPromptPrice(nftAddress, tokenId));
    return price;
}

export const getTokenPrice = async (nftAddress, tokenId) => {
    const price = await marketplace().then((res) => res.getTokenPrice(nftAddress, tokenId));
    return price;
}