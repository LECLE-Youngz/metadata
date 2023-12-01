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
import { fetchWalletByAddress, getPromptPrice, getTokenPrice, ownerOf } from "src/api";
@Controller("api/v1/data")
export class DataController {
    constructor(private readonly dataService: DataService, private readonly nftService: NftService) { }
    @Post()
    async createData(@Body() createData: CreateDataDto): Promise<Data> {
        const existedData = await this.dataService.findDataById(createData.id);
        if (existedData) {
            throw new BadRequestException("Data already exists");
        }
        return this.dataService.createData(createData.id, createData.addressCollection, createData.meta);
    }

    @Get(":id")
    async getDataById(@Param("id") id: number, @Headers('Authorization') accessToken: string): Promise<Data> {
        const user = await verifyAccessToken(accessToken);
        const wallet = await fetchWalletByAddress(user.email);
        if (!wallet) {
            throw new NotFoundException(`Can not find wallet with ${user.email}`);
        }
        const data = await this.dataService.findDataById(id);
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
        const addressOwner: string = await ownerOf(nft.id);
        // if (addressOwner !== wallet.data.address) {
        //     throw new BadRequestException(`You are not owner of this nft`);

        // }
        return data;
    }


}