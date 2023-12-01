import { BadRequestException } from "@nestjs/common";
import { GaxiosResponse, request } from "gaxios";
import * as dotenv from "dotenv";
import { ResponseNftTokenId } from "src/types";
import { queryNftsByAddress, queryAllNfts } from "./queryGraph";
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
        const tokenIdArray = data.data.transfers.map((transfer) => Number(transfer.tokenId));
        return tokenIdArray;
    } catch (err) {
        console.log('Error fetching data: ', err);
        throw new BadRequestException('Failed to fetch data from GraphQL API');
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
        throw new BadRequestException('Failed to fetch data from GraphQL API');
    }
}

// export async function queryListPromptAllower(tokenId: number): Promise<Array<string>> {
//     try {
//         const response: GaxiosResponse<any> = await request({
//             url: process.env.THE_GRAPH_API_URL,
//             method: 'POST',
//             data: {
//                 query: queryPromptAllower,
//                 variables: {
//                     tokenId: tokenId.toString(),
//                 },
//             },
//         });

//         const data = response.data;
//         // Extract token IDs from the response data
//         const promptAllower = data.data.promptBoughts.map((promptBought) => promptBought.buyer);

//         return promptAllower;
//     } catch (err) {
//         console.log('Error fetching data: ', err);
//         throw new BadRequestException('Failed to fetch data from GraphQL API');
//     }
// }