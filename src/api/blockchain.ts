/* eslint-disable */
import { ethers, JsonRpcProvider } from "ethers";
import marketplaceABI from "src/configs/Marketplace.sol/NftMarketplace.json";
import collectionABI from "src/configs/NexthypeNFT.sol/NEXTHYPE.json";
import factoryABI from "src/configs/GenerativeNFTFactory.sol/GenerativeNFTFactory.json";
import generativeABI from "src/configs/GenerativeNFT.sol/GenerativeNFT.json";
import * as dotenv from "dotenv";
import mysteryABI from "src/configs/MysteryNft.sol/MysteryDropEvent.json";
import mysteryDropABI from "src/configs/MysteryNft.sol/MysteryBox.json";
dotenv.config();

const provider = new JsonRpcProvider(process.env.FUJI_RPC);


export const marketplace = async () => {
    const contract = new ethers.Contract(
        process.env.MARKETPLACE_ADDRESS,
        marketplaceABI.abi,
        provider
    );

    return contract;
};

export const collection = async (addressCollection: string) => {
    const contract = new ethers.Contract(
        addressCollection,
        collectionABI.abi as any,
        provider
    );

    return contract;
}

export const mysteryCollection = async (addressCollection: string) => {
    const contract = new ethers.Contract(
        addressCollection,
        mysteryABI as any,
        provider
    );

    return contract;

}

export const mysteryDropCollection = async (addressCollection: string) => {
    const contract = new ethers.Contract(
        addressCollection,
        mysteryDropABI.abi as any,
        provider
    );

    return contract;

}

export const factory = async () => {
    const contract = new ethers.Contract(
        process.env.FACTORY_ADDRESS,
        factoryABI.abi,
        provider
    );

    return contract;
}

export const generative = async (address) => {
    const contract = new ethers.Contract(address, generativeABI.abi, provider);

    return contract;
};