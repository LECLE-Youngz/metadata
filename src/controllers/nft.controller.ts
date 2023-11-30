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
import { DataService, NftService, PostService, UserService, WalletService } from "src/services";
import { Nft } from "src/schemas";
import { verifyAccessToken } from "src/auth/google.verifier";
import gaxios from "gaxios";
import { fetchWalletByAddress, ownerOf } from "src/api";
import { ResponseWallet } from "src/types";

@Controller("api/v1/nfts")
export class NftController {

    constructor(private readonly nftService: NftService,
        private readonly userService: UserService,
        private readonly dataService: DataService,
        private readonly postService: PostService
    ) { }


    @Get()
    async getAllNfts() {
        const nfts = await this.nftService.findAll();
        const nftsWithOwners = await Promise.all(
            nfts.map(async (nft) => {
                const addressOwner: string = await ownerOf(nft.id);
                const wallet = await fetchWalletByAddress(addressOwner);
                if (!wallet) {
                    return {
                        id: nft.id,
                        name: nft.name,
                        description: nft.description,
                        image: nft.image,
                        price: nft.price,
                        owner: null,
                        promptPrice: nft.promptPrice,
                        promptBuyer: nft.promptBuyer,
                        addressCollection: nft.addressCollection,
                        promptAllower: nft.promptAllower,
                        attributes: nft.attributes,
                    };
                }
                const ownerInfo = await this.userService.findUserByEmail(wallet.data.owner);
                return {
                    id: nft.id,
                    name: nft.name,
                    description: nft.description,
                    image: nft.image,
                    price: nft.price,
                    owner: ownerInfo,
                    promptPrice: nft.promptPrice,
                    promptBuyer: nft.promptBuyer,
                    addressCollection: nft.addressCollection,
                    promptAllower: nft.promptAllower,
                    attributes: nft.attributes,
                };
            })
        );

        return nftsWithOwners
    }



    @Get("/owner/:id")
    async getNftsByOwnerId(@Param("id") id: string): Promise<Array<Nft>> {
        const user = await this.userService.findUserById(id);
        const wallet = await fetchWalletByAddress(user.email);
        if (!wallet) {
            return [];
        }
        return await this.nftService.findNftsByOwnerId(user.id);
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
            createNft.image,
            createNft.price,
            createNft.promptPrice,
            createNft.promptBuyer,
            createNft.promptAllower,
            createNft.addressCollection,
        );
    }

    // Data Service

    @Get("/data/:id")
    async getDataById(@Param("id") id: number, @Headers('Authorization') accessToken: string) {
        const nft = await this.nftService.findNftById(id);
        const data = await this.dataService.findDataById(id);

        if (nft.promptPrice == "0") {
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

    @Get("/post/:id")
    async getPostByNftId(@Param("id") id: number) {
        const nft = await this.nftService.findNftById(id);
        const post = await this.postService.findPostByOwnerId(nft.ownerId);
        return post.filter((post) => post.nftId == id);
    }

    @Get(":id")
    async getNftById(@Param("id") id: number) {
        const nfts = await this.nftService.findNftById(id);
        const addressOwner: string = await ownerOf(id);
        const wallet = await fetchWalletByAddress(addressOwner);
        if (!wallet) {
            return {
                id: nfts.id,
                name: nfts.name,
                description: nfts.description,
                image: nfts.image,
                price: nfts.price,
                owner: null,
                promptPrice: nfts.promptPrice,
                promptBuyer: nfts.promptBuyer,
                addressCollection: nfts.addressCollection,
                promptAllower: nfts.promptAllower,
                attributes: nfts.attributes,
            };
        }
        const ownerInfo = await this.userService.findUserByEmail(wallet.data.owner);
        return {
            id: nfts.id,
            name: nfts.name,
            description: nfts.description,
            image: nfts.image,
            price: nfts.price,
            owner: ownerInfo,
            promptPrice: nfts.promptPrice,
            promptBuyer: nfts.promptBuyer,
            addressCollection: nfts.addressCollection,
            promptAllower: nfts.promptAllower,
            attributes: nfts.attributes,
        };

    }
}