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
import { fetchWalletByAddress, getPromptPrice, getTokenPrice, ownerOf, queryAllNFTs, queryNFTsByAddress } from "src/api";

import * as dotenv from "dotenv";
dotenv.config();

import BN from "bn.js"

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
                if (wallet) {
                    const userInfo = await this.userService.findUserByEmail(wallet.data.owner);
                    const price: Array<BN> = await getTokenPrice(nft.addressCollection, String(nft.id))
                    const promptPrice: Array<BN> = await getPromptPrice(nft.addressCollection, String(nft.id))
                    return {
                        id: nft.id,
                        name: nft.name,
                        description: nft.description,
                        image: nft.image,
                        price: {
                            avax: price[0].toString(),
                            usd: price[1].toString(),
                        },
                        owner: {
                            id: userInfo.id,
                            name: userInfo.name,
                            email: userInfo.email,
                            picture: userInfo.picture,
                            address: addressOwner,
                        },
                        promptPrice: {
                            avax: promptPrice[0].toString(),
                            usd: promptPrice[1].toString(),
                        },
                        promptBuyer: [],
                        addressCollection: nft.addressCollection,
                        promptAllower: [],
                        attributes: nft.attributes,
                    };
                }
            })
        );

        return nftsWithOwners
    }



    @Get("/owner/:id")
    async getNftsByOwnerId(@Param("id") id: string): Promise<any> {
        const user = await this.userService.findUserById(id);
        const wallet = await fetchWalletByAddress(user.email);
        if (!wallet) {
            return [];
        }
        const listNft = (await queryNFTsByAddress(wallet.data.address))

        const listInfoNft = await this.nftService.findNftsByListId(listNft);

        const mappingPrice = listInfoNft.map(async (nft) => {
            const price: Array<BN> = await getTokenPrice(nft.addressCollection, String(nft.id))
            const promptPrice: Array<BN> = await getPromptPrice(nft.addressCollection, String(nft.id))
            return {
                id: nft.id,
                name: nft.name,
                description: nft.description,
                image: nft.image,
                price: {
                    avax: price[0].toString(),
                    usd: price[1].toString(),
                },
                owner: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    picture: user.picture,
                    address: user.email,
                },
                promptPrice: {
                    avax: promptPrice[0].toString(),
                    usd: promptPrice[1].toString(),
                },
                promptBuyer: [],
                addressCollection: nft.addressCollection,
                promptAllower: [],
                attributes: nft.attributes,
            };
        })

        return mappingPrice
    }

    @Post()
    async createNft(@Body() createNft: CreateNftDto, @Headers('Authorization') accessToken: string): Promise<Nft> {
        const user = await verifyAccessToken(accessToken);
        const wallet = await fetchWalletByAddress(user.email);
        const addressOwner: string = await ownerOf(createNft.id);
        if (addressOwner !== wallet.data.address) {
            throw new BadRequestException(`You are not owner of this nft`);
        }
        const existedNft = await this.nftService.findNftById(createNft.id);
        if (existedNft) {
            throw new BadRequestException(`Nft already exists`);
        }
        await this.dataService.createData(createNft.id, createNft.meta);

        return await this.nftService.createNft(
            createNft.id,
            createNft.name,
            createNft.description,
            createNft.image,
            createNft.addressCollection,
        );
    }

    // Data Service

    @Get("/data/:id")
    async getDataById(@Param("id") id: number, @Headers('Authorization') accessToken: string) {
        const nft = await this.nftService.findNftById(id);
        const data = await this.dataService.findDataById(id);
        if (!data) {
            throw new BadRequestException(`Data does not exist`);
        }
        const promptPrice: Array<BN> = await getPromptPrice(nft.addressCollection, String(nft.id))
        if (promptPrice[0].toString() === "0") {
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
        const addressOwner: string = await ownerOf(id);
        const wallet = await fetchWalletByAddress(addressOwner);
        const user = await this.userService.findUserByEmail(wallet.data.owner);
        const post = await this.postService.findPostByOwnerId(user.id);
        return post.filter((post) => post.nftId == id);
    }

    @Get(":id")
    async getNftById(@Param("id") id: number) {
        const nfts = await this.nftService.findNftById(id);
        if (!nfts) {
            throw new BadRequestException(`Nft does not exist`);
        }
        const addressOwner: string = await ownerOf(id);
        const wallet = await fetchWalletByAddress(addressOwner);
        if (!wallet) {
            throw new BadRequestException(`Wallet does not exist`);
        }
        const price: Array<BN> = await getTokenPrice(nfts.addressCollection, String(nfts.id))
        const promptPrice: Array<BN> = await getPromptPrice(nfts.addressCollection, String(nfts.id))
        const ownerInfo = await this.userService.findUserByEmail(wallet.data.owner);
        return {
            id: nfts.id,
            name: nfts.name,
            description: nfts.description,
            image: nfts.image,
            price: {
                avax: price[0].toString(),
                usd: price[1].toString(),

            },
            owner: ownerInfo,
            promptPrice: {
                avax: promptPrice[0].toString(),
                usd: promptPrice[1].toString(),
            },
            promptBuyer: [],
            addressCollection: nfts.addressCollection,
            promptAllower: [],
            attributes: nfts.attributes,
        };

    }
}