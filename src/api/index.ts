/* eslint-disable */
import { ethers, JsonRpcProvider } from "ethers";
import marketplaceABI from "src/configs/marketplace/marketplace.json";
import collectionABI from "src/configs/nexthype/nexthype.json";
import factoryABI from "src/configs/factory/factory.json";



export * from "./node"

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
        collectionABI.abi,
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

