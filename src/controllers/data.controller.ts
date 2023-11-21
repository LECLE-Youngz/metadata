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
@Controller("api/v1/datum")
export class DataController {
    constructor(private readonly dataService: DataService, private readonly nftService: NftService) { }
    @Post()
    async createData(@Body() createData: CreateDataDto): Promise<Data> {
        const existedData = await this.dataService.findDataById(createData.id);
        if (existedData) {
            throw new BadRequestException("Data already exists");
        }
        return this.dataService.createData(createData.id, createData.meta);
    }
    @Get(":id")
    async getDataById(@Param("id") id: number, @Headers('Authorization') accessToken: string): Promise<Data> {
        const data = await this.dataService.findDataById(id);
        if (!data) {
            throw new NotFoundException(`Can not find data with ${id}`);
        }

        const nft = await this.nftService.findNftById(id);
        if (!nft) {
            throw new NotFoundException(`Can not find nft with ${id}`);
        }

        if (nft.promptPrice == 0) {
            return data;
        }

        const User = await verifyAccessToken(accessToken);
        // TODO: Blockchain verification with User.address
        return data;
    }
}