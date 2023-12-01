import {
    Controller,
    Get,
    Param,
    Post,
    Query,
    Body,
    Put,
    NotFoundException,
    Headers,
    BadRequestException,
} from "@nestjs/common";
import { CreateDataDto } from "src/dtos/create-data.dto";
import { DataService, NftService } from "src/services";
import { Data, User } from "src/schemas";
//   import { getCurrentPromptBuyer, getCurrentPromptPrice } from "src/utils/blockchain";
import { verifyAccessToken } from "src/auth/google.verifier";
import BN from "bn.js"
import { fetchWalletByAddress, getPromptPrice, getTokenPrice, ownerOf, queryListAllower, queryNFTsByAddress, queryPromptAllowerByTokenAndAddress } from "src/api";
import { NftCollection } from "src/types";

@Controller("api/v1/data")
export class DataController {
    constructor(private readonly dataService: DataService, private readonly nftService: NftService) { }

    @Get(":id/collection/:addressCollection")
    async getDataById(@Param("id") id: number, @Param("addressCollection") addressCollectionRaw: string, @Headers('Authorization') accessToken: string): Promise<Data> {
        const addressCollection = addressCollectionRaw.toLowerCase();
        const user = await verifyAccessToken(accessToken);
        const wallet = await fetchWalletByAddress(user.email);
        if (!wallet) {
            throw new NotFoundException(`Can not find wallet with ${user.email}`);
        }
        const data = await this.dataService.findDataByIdAndAddressCollection(id, addressCollection);
        if (!data) {
            throw new NotFoundException(`Can not find data with ${id}`);
        }

        const nft = await this.nftService.findNftByIdAndAddressCollection(id, data.addressCollection);
        if (!nft) {
            throw new NotFoundException(`Can not find nft with ${id}`);
        }
        const promptPrice: Array<BN> = await getPromptPrice(nft.addressCollection, String(nft.id));
        if (promptPrice[0].toString() === "0") {
            return data;
        }
        const listBoughts = await queryListAllower(nft.addressCollection, nft.id);

        if (listBoughts.find(bought => bought != wallet.data.address)) {
            throw new BadRequestException(`You are not the owner of this data`);
        }
        return data;
    }

    @Get("/owner")
    async getOwnerById(@Headers('Authorization') accessToken: string) {
        const user = await verifyAccessToken(accessToken);
        const wallet = await fetchWalletByAddress(user.email);
        if (!wallet) {
            throw new NotFoundException(`Can not find wallet with ${user.email}`);
        }

        const listData = await queryPromptAllowerByTokenAndAddress(wallet.data.address);
        const listDataInfo = await this.dataService.findDataByListIdAndCollection(listData.map(data => ({ id: data.tokenId, addressCollection: data.contract })));
        return listDataInfo;
    }



}