/* eslint-disable */
import { ethers, JsonRpcProvider } from "ethers";
import marketplaceABI from "src/configs/Marketplace.sol/NftMarketplace.json";
import collectionABI from "src/configs/NexthypeNFT.sol/NEXTHYPE.json";
import factoryABI from "src/configs/GenerativeNFT.sol/GenerativeNFT.json";
import * as dotenv from "dotenv";
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

export const collection = async () => {
    const contract = new ethers.Contract(
        process.env.COLLECTION_ADDRESS,
        collectionABI.abi as any,
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

