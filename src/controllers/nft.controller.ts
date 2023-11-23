import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    Headers,
    BadRequestException,
} from "@nestjs/common";
import { CreateNftDto } from "src/dtos";
import { DataService, NftService, UserService, WalletService } from "src/services";
import { Nft } from "src/schemas";
import { verifyAccessToken } from "src/auth/google.verifier";

@Controller("api/v1/nfts")
export class NftController {

    constructor(private readonly nftService: NftService,
        private readonly userService: UserService,
        private readonly dataService: DataService,
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
    async createNft(@Body() createNft: CreateNftDto, @Headers('Authorization') accessToken: string): Promise<Nft> {
        const user = await verifyAccessToken(accessToken);
        const existedNft = await this.nftService.findNftById(createNft.id);
        if (existedNft) {
            throw new BadRequestException(`Nft already exists`);
        }
        await this.dataService.createData(createNft.id, createNft.meta);
        return await this.nftService.createNft(
            createNft.id,
            user.id,
            createNft.name,
            createNft.description,
            createNft.thumbnail,
            createNft.price,
            createNft.promptPrice,
            createNft.promptBuyer,
        );
    }

    // Data Service

    @Get("/data/:id")
    async getDataById(@Param("id") id: number, @Headers('Authorization') accessToken: string) {
        const nft = await this.nftService.findNftById(id);
        const data = await this.dataService.findDataById(id);

        if (nft.promptPrice === 0) {
            return {
                id: data.id,
                name: data.meta,
            };
        }
        const user = await verifyAccessToken(accessToken);
        // check address wallet in nodes network
        // check if user is owner of data in blockchain 
        return {
            id: data.id,
            name: data.meta,
        };
    }
}