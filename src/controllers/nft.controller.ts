import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    BadRequestException,
} from "@nestjs/common";
import { CreateNftDto } from "src/dtos";
import { NftService, UserService } from "src/services";
import { Nft } from "src/schemas";

@Controller("api/v1/nfts")
export class NftController {

    constructor(private readonly nftService: NftService,
        private readonly userService: UserService
    ) { }

    @Get(":id")
    async getNftById(@Param("id") id: number) {
        const nfts = await this.nftService.findNftById(id);
        const owner = await this.userService.findUserById(nfts.ownerId);
        return {
            id: nfts.id,
            name: nfts.name,
            description: nfts.description,
            thumbnail: nfts.thumbnail,
            price: nfts.price,
            owner: owner,
            onSale: nfts.onSale,
            promptPrice: nfts.promptPrice,
            promptBuyer: nfts.promptBuyer,
        };

    }
    @Get()
    async getAllNfts() {
        const nfts = await this.nftService.findAll();
        const nftsWithOwners = await Promise.all(
            nfts.map(async (nft) => {
                const owner = await this.userService.findUserById(nft.ownerId);
                return {
                    id: nft.id,
                    name: nft.name,
                    description: nft.description,
                    thumbnail: nft.thumbnail,
                    price: nft.price,
                    owner: owner,
                    onSale: nft.onSale,
                    promptPrice: nft.promptPrice,
                    promptBuyer: nft.promptBuyer,
                };
            })
        );

        return nftsWithOwners
    }



    @Get("/owner/:id")
    async getNftsByOwnerId(@Param("id") id: string): Promise<Array<Nft>> {
        return await this.nftService.findNftsByOwnerId(id);
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