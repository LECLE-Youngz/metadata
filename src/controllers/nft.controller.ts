import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    BadRequestException,
} from "@nestjs/common";
import { CreateNftDto } from "src/dtos/create-nft.dto";
import { NftService } from "src/services";
import { Nft } from "src/schemas";

@Controller("api/v1/nfts")
export class NftController {

    constructor(private readonly nftService: NftService) { }

    @Get(":id")
    async getNftById(@Param("id") id: number): Promise<Nft> {
        return await this.nftService.findNftById(id);
    }

    @Get()
    async getAllNfts(): Promise<Array<Nft>> {
        return await this.nftService.findAllNft();
    }

    @Post()
    async createNft(@Body() createNft: CreateNftDto): Promise<Nft> {
        const existedNft = await this.nftService.findNftById(createNft.id);
        if (existedNft) {
            throw new BadRequestException(`Nft already exists`);
        }
        return await this.nftService.createNft(createNft);
    }
}