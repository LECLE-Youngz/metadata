import { BadRequestException } from "@nestjs/common";
import { GaxiosResponse, request } from "gaxios";
import * as dotenv from "dotenv";
import {
    ResponseNftTokenId,
    QueryResponseBought,
    ExportNftCollection,
    ResponseListNftAndCollection,
    ResponseListPromptByAddress
} from "src/types";
import {
    queryVerifyTransferPrompt,
    getAllSubscriber,
    getAllSubscribing,
    queryNftsByAddress,
    queryCreatorStatus,
    queryAllNfts,
    queryPromptBoughts,
    queryPromptAllowsByAddress,
    queryAllCollectionByDeployer,
    queryAllCollectionByAddress,
    queryAllCollection,
    queryDeplpoyerByCollection,
    queryExclusiveNFTCreated,
    queryVerifyTransferNft,
    queryAllCollectionByAddressWithoutExclusive,
    queryAllEvent,
    queryAllEventByDeployer,
    queryAllEventByAddressCollection,
    getOwnerByEvent,
    getEventTag,
    getMysteryEventByOwner,
    getEventByDeployer
} from "./queryGraph";
import {
    ResponseListCollection,
    ResponseListCollectionAndOwner,
    ResponseOwner, Transfer,
    ResponseListSubscriber,
    ResponseListSubscribing,
    ExportSubscribing,
    ResponseCreatorStatus,
    ResponseExclusiveNFTCreateds,
    ResponseVerifyTransferNft,
    ResponseVerifyTransferPrompt,
    ResponseCollectionByAddress,
    ResponseEvent,
    ResponseEventByAddress,
    ResponseEventDeployer,
    ResponseTags,
    ResponseMysteryByAddress,
    ResponseEventByDeployer
} from "src/types/response.type";

import Web3 from "web3";
dotenv.config();

export async function queryNFTsByAddress(address: string, collection: string): Promise<number[]> {
    try {
        const response: GaxiosResponse<ResponseNftTokenId> = await request({
            url: process.env.THE_GRAPH_API_URL,
            method: 'POST',
            data: {
                query: queryNftsByAddress,
                variables: {
                    address: address,
                    collectionAddr: collection,
                },
            },
        });
        const data = response.data;

        const minusResult: Transfer[] =
            data.data.transfersTo && data.data.transfersFrom
                ? data.data.transfersTo?.filter(
                    (transferTo: Transfer) => !data.data.transfersFrom.some((transferFrom: Transfer) => transferFrom.tokenId === transferTo.tokenId)
                )
                : [];
        const tokenIdArray = minusResult?.map((transfer) => Number(transfer.tokenId)) ?? [];
        return tokenIdArray;
    } catch (err) {
        return []
    }
}



export async function queryAllNFTs(): Promise<number[]> {
    try {
        const response: GaxiosResponse<ResponseNftTokenId> = await request({
            url: process.env.THE_GRAPH_API_URL,
            method: 'POST',
            data: {
                query: queryAllNfts, // Assuming queryAllNfts is defined somewhere
                variables: {},
            },
        });

        const data = response.data;
        // Extract token IDs from the response data
        const tokenIdArray = data.data.transfers.map((transfer) => Number(transfer.tokenId));

        return tokenIdArray;
    } catch (err) {
        console.log('Error fetching data: ', err);
        throw new BadRequestException('Failed to fetch data from GraphQL API, failed to queryAllNFTs');
    }
}

export async function queryListAllower(addressCollection: string, tokenId: number): Promise<Array<string>> {
    try {
        const response: GaxiosResponse<any> = await request({
            url: process.env.THE_GRAPH_API_URL,
            method: 'POST',
            data: {
                query: queryPromptBoughts,
                variables: {
                    tokenId: tokenId.toString(),
                    address: addressCollection,
                },
            },
        });

        const data: QueryResponseBought = response.data;
        // Extract token IDs from the response data
        const promptBuyer = data.data.promptBoughts.map((prompt) => prompt.buyer);
        const itemBuyer = data.data.itemBoughts.map((item) => item.buyer);
        const transferBuyer = data.data.transfers.map((transfer) => transfer.to);

        // filter duplicate
        return [...promptBuyer, ...itemBuyer, ...transferBuyer];
    } catch (err) {
        return []
    }
}


export async function queryPromptBuyerByTokenAndAddress(addressCollection: string, tokenId: number): Promise<Array<string>> {
    try {
        const response: GaxiosResponse<any> = await request({
            url: process.env.THE_GRAPH_API_URL,
            method: 'POST',
            data: {
                query: queryPromptBoughts,
                variables: {
                    tokenId: tokenId.toString(),
                    address: addressCollection,
                },
            },
        });

        const data: QueryResponseBought = response.data;
        // Extract token IDs from the response data
        const promptBuyer = data.data.promptBoughts.map((prompt) => prompt.buyer);

        // filter duplicate
        return [...promptBuyer];
    } catch (err) {
        return []
    }
}

export async function queryAllNFTsByAddressAndCollection(address: string): Promise<Array<ExportNftCollection>> {
    try {
        const response: GaxiosResponse<ResponseListNftAndCollection> = await request({
            url: process.env.THE_GRAPH_API_URL,
            method: 'POST',
            data: {
                query: queryAllCollectionByAddress,
                variables: {
                    address: address,
                },
            },
        });
        const data = response.data;
        const minusResult: Transfer[] =
            data.data.transfersTo && data.data.transfersFrom
                ? data.data.transfersTo.filter(
                    (transferTo: Transfer) => !data.data.transfersFrom.some((transferFrom: Transfer) => transferFrom.tokenId.toLocaleLowerCase() === transferTo.tokenId.toLocaleLowerCase())
                )
                : [];

        const final = minusResult.map((transfer) => {
            return {
                tokenId: Number(transfer.tokenId),
                contract: transfer.contract,
            }
        });
        return final;

    }
    catch (err) {
        console.log('Error fetching data: ', err);
        throw new BadRequestException('Failed to fetch data from GraphQL API');
    }
}

export async function queryPromptAllowerByTokenAndAddress(address: string): Promise<Array<ExportNftCollection>> {
    try {
        const response: GaxiosResponse<ResponseListPromptByAddress> = await request({
            url: process.env.THE_GRAPH_API_URL,
            method: 'POST',
            data: {
                query: queryPromptAllowsByAddress,
                variables: {
                    address: address,
                },
            },
        });

        const data: QueryResponseBought = response.data;

        const promptBuyer = data.data.promptBoughts.map((prompt) => {
            return {
                tokenId: Number(prompt.tokenId),
                contract: prompt.nftAddress,
            }
        });
        const itemBuyer = data.data.itemBoughts.map((item) => {
            return {
                tokenId: Number(item.tokenId),
                contract: item.nftAddress,
            }
        });
        const transferBuyer = data.data.transfers.map((transfer) => {
            return {
                tokenId: Number(transfer.tokenId),
                contract: transfer.contract,
            }
        });

        // filter duplicate
        return [...promptBuyer, ...itemBuyer, ...transferBuyer];

    } catch (err) {
        console.log('Error fetching data: ', err);
        throw new BadRequestException('Failed to fetch data from GraphQL API, failed to queryPromptAllowerByTokenAndAddress');
    }
}

export async function queryAllCollectionFactory(): Promise<Array<string>> {
    try {
        const response: GaxiosResponse<any> = await request({
            url: process.env.THE_GRAPH_API_URL,
            method: 'POST',
            data: {
                query: queryAllCollection,
                variables: {},
            },
        });

        const data: ResponseListCollection = response.data;
        // Extract token IDs from the response data
        const collectionArray = data.data.erc721TokenCreateds.map((collection) => collection.tokenAddress);
        return collectionArray;

    } catch (err) {
        console.log('Error fetching data: ', err);
        throw new BadRequestException('Failed to fetch data from GraphQL API, failed to queryAllCollection');
    }
}

export async function queryAllCollectionByDeployerAPI(address: string): Promise<Array<string>> {
    try {
        const response: GaxiosResponse<any> = await request({
            url: process.env.THE_GRAPH_API_URL,
            method: 'POST',
            data: {
                query: queryAllCollectionByDeployer,
                variables: {
                    address: address,
                },
            },
        });

        const data: ResponseListCollectionAndOwner = response.data;

        const collectionArray = data.data.erc721TokenCreateds.map((collection) => {
            return collection.tokenAddress
        });
        return collectionArray;

    } catch (err) {
        console.log('Error fetching data: ', err);
        throw new BadRequestException('Failed to fetch data from GraphQL API, failed to queryAllCollectionByDeployerAPI');
    }
}

export async function queryAllCollectionByAddressAPI(address: string): Promise<string> {
    try {
        const response: GaxiosResponse<any> = await request({
            url: process.env.THE_GRAPH_API_URL,
            method: 'POST',
            data: {
                query: queryDeplpoyerByCollection,
                variables: {
                    address: address,
                },
            },
        });
        const data: ResponseOwner = response.data;
        return data.data.erc721TokenCreateds[0].owner;

    } catch (err) {
        console.log('Error fetching data: ', err);
        throw new BadRequestException('Failed to fetch data from GraphQL API, failed to queryAllCollectionByAddressAPI');
    }
}

export async function querySubscriberAPI(address: string): Promise<Array<string>> {
    try {
        const response: GaxiosResponse<any> = await request({
            url: process.env.THE_GRAPH_API_URL,
            method: 'POST',
            data: {
                query: getAllSubscriber,
                variables: {
                    creatorAddr: address,
                },
            },
        });
        const data: ResponseListSubscriber = response.data;
        const subscriberArray = data.data.premiumMemberSubscribeds.map((subscriber) => {
            return subscriber.subscriber;
        });
        return subscriberArray;

    } catch (err) {
        console.log('Error fetching data: ', err);
        throw new BadRequestException('Failed to fetch data from GraphQL API, failed to querySubscriberAPI');
    }
}
export async function querySubscribingAPI(address: string): Promise<Array<ExportSubscribing>> {
    try {
        const response: GaxiosResponse<any> = await request({
            url: process.env.THE_GRAPH_API_URL,
            method: 'POST',
            data: {
                query: getAllSubscribing,
                variables: {
                    userAddr: Web3.utils.toChecksumAddress(address),
                },
            },
        });
        const data: ResponseListSubscribing = response.data;
        const subscribingArray = data.data.premiumNFTTransfers.map((subscribing) => {
            return {
                contract: subscribing.contract,
                tokenId: subscribing.tokenId,
            }
        });
        return subscribingArray;

    } catch (err) {
        console.log('Error fetching data: ', err);
        throw new BadRequestException('Failed to fetch data from GraphQL API, failed to querySubscribingAPI');
    }
}

export async function getCreatorStatusAPI(address: string): Promise<boolean> {
    try {
        const response: GaxiosResponse<any> = await request({
            url: process.env.THE_GRAPH_API_URL,
            method: 'POST',
            data: {
                query: queryCreatorStatus,
                variables: {
                    address: address,
                },
            },
        });
        const data: ResponseCreatorStatus = response.data;
        const creatorStatus = data.data.premiumTokenCreateds.length > 0;
        return creatorStatus;
    } catch (err) {
        console.log('Error fetching data: ', err);
        throw new BadRequestException('Failed to fetch data from GraphQL API');
    }
}

export async function getTokenAddressByUserAddress(address: string): Promise<string> {
    try {
        const response: GaxiosResponse<any> = await request({
            url: process.env.THE_GRAPH_API_URL,
            method: 'POST',
            data: {
                query: queryCreatorStatus,
                variables: {
                    address: address,
                },
            },
        });
        const data: ResponseCreatorStatus = response.data;
        return data.data.premiumTokenCreateds[0]?.tokenAddress ?? "";
    } catch (err) {
        console.log('Error fetching data: ', err);
        throw new BadRequestException('Failed to fetch data from GraphQL API');
    }

}

export async function getExclusiveNFTCollection(address: string): Promise<string> {
    try {
        const response: GaxiosResponse<any> = await request({
            url: process.env.THE_GRAPH_API_URL,
            method: 'POST',
            data: {
                query: queryExclusiveNFTCreated,
                variables: {
                    address: address,
                },
            },
        });
        const data: ResponseExclusiveNFTCreateds = response.data;
        return data.data.exclusiveNFTCreateds[0]?.tokenAddress ?? null;
    } catch (err) {
        console.log('Error fetching data: ', err);
        throw new BadRequestException('Failed to fetch data from GraphQL API');
    }

}

export async function verifyTransferNftAPI(addressSeller: string, addressBuyer: string, tokenId: string, collection: string): Promise<boolean> {
    try {
        const response: GaxiosResponse<ResponseVerifyTransferNft> = await request({
            url: process.env.THE_GRAPH_API_URL,
            method: 'POST',
            data: {
                query: queryVerifyTransferNft,
                variables: {
                    seller: addressSeller,
                    buyer: addressBuyer,
                    tokenId: tokenId,
                    collection: collection,
                },
            },
        });
        const data: ResponseVerifyTransferNft = response.data;
        return data.data.itemBoughts.length > 0 && data.data.itemListeds.length > 0;
    } catch (err) {
        console.log('Error fetching data: ', err);
        throw new BadRequestException('Failed to fetch data from GraphQL API');
    }
}

export async function verifyTransferPromptAPI(addressSeller: string, addressBuyer: string, tokenId: string, collection: string): Promise<boolean> {
    try {
        const response: GaxiosResponse<ResponseVerifyTransferPrompt> = await request({
            url: process.env.THE_GRAPH_API_URL,
            method: 'POST',
            data: {
                query: queryVerifyTransferPrompt,
                variables: {
                    seller: addressSeller,
                    buyer: addressBuyer,
                    tokenId: tokenId,
                    collection: collection,
                },
            },
        });
        const data: ResponseVerifyTransferPrompt = response.data;
        return data.data.itemListeds.length > 0 && data.data.promptBoughts.length > 0;
    } catch (err) {
        console.log('Error fetching data: ', err);
        throw new BadRequestException('Failed to fetch data from GraphQL API');
    }
}


export async function getCollectionByDeployer(address: string): Promise<string> {
    try {
        const response: GaxiosResponse<any> = await request({
            url: process.env.THE_GRAPH_API_URL,
            method: 'POST',
            data: {
                query: queryExclusiveNFTCreated,
                variables: {
                    address: address,
                },
            },
        });
        const data: ResponseExclusiveNFTCreateds = response.data;
        const creatorStatus = data.data.exclusiveNFTCreateds[0].tokenAddress;
        return creatorStatus;
    } catch (err) {
        return ""
    }
}

export async function queryAllCollectionByAddressWithoutExclusiveAPI() {
    try {
        const response: GaxiosResponse<ResponseCollectionByAddress> = await request({
            url: process.env.THE_GRAPH_API_URL,
            method: 'POST',
            data: {
                query: queryAllCollectionByAddressWithoutExclusive,
                variables: {},
            },
        });
        const data: ResponseCollectionByAddress = response.data;
        // merge 2 array
        return data.data.nfttransfers;


    } catch (err) {
        console.log('Error fetching data: ', err);
        throw new BadRequestException('Failed to fetch data from GraphQL API | queryAllCollectionByAddressWithoutExclusiveAPI');
    }
}

export async function queryAllEventAPI(): Promise<Array<string>> {
    try {
        const response: GaxiosResponse<ResponseEvent> = await request({
            url: process.env.THE_GRAPH_API_URL,
            method: 'POST',
            data: {
                query: queryAllEvent,
                variables: {},
            },
        });
        const data: ResponseEvent = response.data;
        return [...data.data.mysteryEventCreateds, ...data.data.luckyTokenCreateds].map((event) => event.tokenAddress);
    }
    catch (err) {
        console.log('Error fetching data: ', err);
        throw new BadRequestException('Failed to fetch data from GraphQL API | queryAllEventAPI');
    }

}

export async function queryEventByDeployerAPI(deployer: string): Promise<Array<string>> {
    try {
        const response: GaxiosResponse<ResponseEvent> = await request({
            url: process.env.THE_GRAPH_API_URL,
            method: 'POST',
            data: {
                query: queryAllEventByDeployer,
                variables: {
                    owner: deployer
                },
            },
        });
        const data: ResponseEvent = response.data;
        return [...data.data.mysteryEventCreateds, ...data.data.luckyTokenCreateds].map((event) => event.tokenAddress);
    }
    catch (err) {
        console.log('Error fetching data: ', err);
        throw new BadRequestException('Failed to fetch data from GraphQL API | queryAllEventAPI');
    }

}

export async function queryEventByAddressAPI(address: string) {
    try {
        const response: GaxiosResponse<ResponseEventByAddress> = await request({
            url: process.env.THE_GRAPH_API_URL,
            method: 'POST',
            data: {
                query: queryAllEventByAddressCollection,
                variables: {
                    contract: address
                },
            },
        });
        const data: ResponseEventByAddress = response.data;
        return data.data.eventTransfers.map((event) => event.tokenId);

    }
    catch (err) {
        console.log('Error fetching data: ', err);
        throw new BadRequestException('Failed to fetch data from GraphQL API | queryAllEventAPI');
    }
}

export async function queryOwnerByCollectionAPI(address: string) {
    try {
        const response: GaxiosResponse<any> = await request({
            url: process.env.THE_GRAPH_API_URL,
            method: 'POST',
            data: {
                query: getOwnerByEvent,
                variables: {
                    eventAddress: address,
                },
            },
        });
        const data: ResponseEventDeployer = response.data;
        return data.data.eventCreateds[0].owner;
    }
    catch (err) {
        console.log('Error fetching data: ', err);
        throw new BadRequestException('Failed to fetch data from GraphQL API | queryDeploerByCollectionAPI');
    }
}

export async function queryTagByCollectionAPI(address: string): Promise<string> {
    try {
        const response: GaxiosResponse<any> = await request({
            url: process.env.THE_GRAPH_API_URL,
            method: 'POST',
            data: {
                query: getEventTag,
                variables: {
                    eventAddress: address,
                },
            },
        });
        const data: ResponseTags = response.data;
        if (data.data.mysteryBoxCreateds.length > 0) {
            return "drop";
        }
        if (data.data.luckyTokenCreateds.length > 0) {
            return "lucky";
        }
        if (data.data.mysteryEventCreateds.length > 0) {
            return "mystery";
        }
        if (data.data.luckyTreasuryCreateds.length > 0) {
            return "treasury";
        }
        return null;
    }
    catch (err) {
        console.log('Error fetching data: ', err);
        throw new BadRequestException('Failed to fetch data from GraphQL API | queryTagByCollectionAPI');
    }

}

export async function queryMysteryByDeployerAPI(deployer: string): Promise<Array<string>> {
    try {
        const response: GaxiosResponse<ResponseMysteryByAddress> = await request({
            url: process.env.THE_GRAPH_API_URL,
            method: 'POST',
            data: {
                query: getMysteryEventByOwner,
                variables: {
                    owner: deployer
                },
            },
        });
        const data: ResponseMysteryByAddress = response.data;
        return data.data.mysteryEventCreateds.map((event) => event.tokenAddress);
    }
    catch (err) {
        console.log('Error fetching data: ', err);
        throw new BadRequestException('Failed to fetch data from GraphQL API | queryAllEventAPI');
    }

}

export async function queryEventAddressByDeployerAPI(deployer: string) {
    try {
        const response: GaxiosResponse<ResponseEventByDeployer> = await request({
            url: process.env.THE_GRAPH_API_URL,
            method: 'POST',
            data: {
                query: getEventByDeployer,
                variables: {
                    owner: deployer
                },
            },
        });
        const data: ResponseEventByDeployer = response.data;
        return data.data;
    }
    catch (err) {
        console.log('Error fetching data: ', err);
        throw new BadRequestException('Failed to fetch data from GraphQL API | queryAllEventAPI');
    }

}