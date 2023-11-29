import { BadRequestException } from "@nestjs/common";
import { GaxiosResponse, request } from "gaxios";
import { ResponseWallet } from "src/types";
import * as dotenv from "dotenv";
dotenv.config();

export const fetchWalletByAddress = async (address: string): Promise<GaxiosResponse<ResponseWallet>> => {
    try {
        const response: GaxiosResponse<any> = await request({
            url: `${process.env.NODE1_ENDPOINT}/wallets/${address}`,
            method: "GET",
        });

        return response;
    } catch (error) {
        return null
    }
};