import { BadRequestException } from "@nestjs/common";
import { GaxiosResponse, request } from "gaxios";
import * as dotenv from "dotenv";
import { ResponseNftTokenId, QueryResponseBought, ExportNftCollection, ResponseListNftAndCollection, ResponseListPromptByAddress } from "src/types";
import { queryNftsByAddress, queryAllNfts, queryPromptBoughts, queryPromptAllowsByAddress, queryAllCollectionByDeployer, queryAllCollectionByAddress, queryAllCollection, queryDeplpoyerByCollection } from "./queryGraph";
import { ExportCollectionAndOwner, ExportOwner, ResponseListCollection, ResponseListCollectionAndOwner, ResponseOwner, Transfer } from "src/types/response.type";

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
                ? data.data.transfersTo.filter(
                    (transferTo: Transfer) => !data.data.transfersFrom.some((transferFrom: Transfer) => transferFrom.tokenId === transferTo.tokenId)
                )
                : [];
        const tokenIdArray = minusResult.map((transfer) => Number(transfer.tokenId));
        return tokenIdArray;
    } catch (err) {
        console.log('Error fetching data: ', err);
        throw new BadRequestException('Failed to fetch data from GraphQL API, failed to queryNFTsByAddress');
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
        console.log('Error fetching data: ', err);
        throw new BadRequestException('Failed to fetch data from GraphQL API, failed to queryPromptAllowerByTokenAndAddress');
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
        console.log('Error fetching data: ', err);
        throw new BadRequestException('Failed to fetch data from GraphQL API, failed to queryPromptBuyerByTokenAndAddress');
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