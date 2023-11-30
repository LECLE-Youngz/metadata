import { BadRequestException } from "@nestjs/common";
import { GaxiosResponse, request } from "gaxios";
import * as dotenv from "dotenv";
import { ResponseNftByAddressGraph } from "src/types";
dotenv.config();

const APIURL = process.env.THE_GRAPH_API_URL;

const tokensQuery = `
query getNFT($address: String) {
  transfers(where: {to: $address}) {
    tokenId
  }
}
`;



export async function queryNFTsByAddress(address: string): Promise<string[]> {
    try {
        const response: GaxiosResponse<ResponseNftByAddressGraph> = await request({
            url: APIURL,
            method: 'POST',
            data: {
                query: tokensQuery,
                variables: {
                    address: address,
                },
            },
        });
        const data = response.data;
        const tokenIdArray = data.data.transfers.map((transfer) => transfer.tokenId);
        return tokenIdArray;
    } catch (err) {
        console.log('Error fetching data: ', err);
        throw new BadRequestException('Failed to fetch data from GraphQL API');
    }
}

