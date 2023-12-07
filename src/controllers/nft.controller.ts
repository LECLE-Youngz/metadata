import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    Headers,
    BadRequestException,
} from "@nestjs/common";
import { ExportSubscribing, NftCollection } from "src/types";

import { CreateNftDto } from "src/dtos";
import { DataService, NftService, PostService, UserService } from "src/services";
import { Nft } from "src/schemas";
import { verifyAccessToken } from "src/auth/google.verifier";
import { fetchWalletByAddress, getPromptPrice, getTokenPrice, ownerOf, querySubscribingAPI, querySubscriberAPI, queryNFTsByAddress, queryListAllower, queryPromptBuyerByTokenAndAddress, queryAllNFTsByAddressAndCollection, queryAllCollectionFactory, ownerCollection, queryAllCollectionByDeployerAPI, queryAllCollectionByAddressAPI, getTokenAddressByUserAddress } from "src/api";

import * as dotenv from "dotenv";
dotenv.config();

import BN from "bn.js"
import Web3 from "web3";

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
                const addressOwner: string = await ownerOf(nft.id, nft.addressCollection);
                const wallet = await fetchWalletByAddress(addressOwner);
                if (wallet) {
                    const userInfo = await this.userService.findUserByEmail(wallet.data.owner);
                    const price: Array<BN> = await getTokenPrice(nft.addressCollection, String(nft.id))
                    const promptPrice: Array<BN> = await getPromptPrice(nft.addressCollection, String(nft.id))
                    const listAllower = await queryListAllower(nft.addressCollection, nft.id);
                    const listBoughts = await queryPromptBuyerByTokenAndAddress(nft.addressCollection, nft.id);
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
                        promptBuyer: listBoughts,
                        addressCollection: nft.addressCollection,
                        promptAllower: listAllower,
                        attributes: nft.attributes,
                    };
                }
            })
        );

        return nftsWithOwners
    }





    @Post()
    async createNft(@Body() createNft: CreateNftDto, @Headers('Authorization') accessToken: string): Promise<Nft> {
        try {
            const user = await verifyAccessToken(accessToken);
            const wallet = await fetchWalletByAddress(user.email);
            const addressOwner: string = await ownerOf(createNft.id, createNft.addressCollection);
            if (addressOwner !== wallet.data.address) {
                throw new BadRequestException(`You are not owner of this nft`);
            }
            const existedNft = await this.nftService.findNftByIdAndAddressCollection(createNft.id, createNft.addressCollection);
            if (existedNft) {
                throw new BadRequestException(`Nft already exists`);
            }
            await this.dataService.createData(createNft.id, createNft.addressCollection.toLowerCase(), createNft.meta);

            return await this.nftService.createNft(
                createNft.id,
                createNft.name,
                createNft.description,
                createNft.image,
                createNft.addressCollection.toLowerCase(),
            );
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    // Data Service

    @Get("/data/:id/collection/:addressCollection")
    async getDataById(@Param("id") id: number, @Param("addressCollection") addressCollectionRaw: string, @Headers('Authorization') accessToken: string) {
        const addressCollection = addressCollectionRaw.toLowerCase();
        const nft = await this.nftService.findNftByIdAndAddressCollection(id, addressCollection.toLowerCase());
        const data = await this.dataService.findDataByIdAndAddressCollection(id, addressCollection.toLowerCase());
        if (!data) {
            throw new BadRequestException(`Data does not exist`);
        }
        const promptPrice: Array<BN> = await getPromptPrice(nft.addressCollection.toLowerCase(), String(nft.id))
        if (promptPrice[0].toString() === "0") {
            return {
                id: data.id,
                name: data.meta,
            };
        }

        const user = await verifyAccessToken(accessToken);
        const wallet = await fetchWalletByAddress(user.email);
        if (!wallet) {
            throw new BadRequestException(`Wallet does not exist`);
        }
        const listBoughts = await queryListAllower(nft.addressCollection, nft.id);
        // check wallet.data.address in listBoughts
        if (listBoughts.find(bought => bought != wallet.data.address)) {
            throw new BadRequestException(`You are not the owner of this data`);
        }
        return {
            id: data.id,
            addressCollection: data.addressCollection,
            name: data.meta,
        };
    }

    @Get("/post/:id/collection/:addressCollection")
    async getPostByNftId(@Param("id") id: number, @Param("addressCollection") addressCollectionRaw: string) {
        const addressCollection = addressCollectionRaw.toLowerCase();
        const addressOwner: string = await ownerOf(id, addressCollection);
        const wallet = await fetchWalletByAddress(addressOwner);
        const user = await this.userService.findUserByEmail(wallet.data.owner);
        const post = await this.postService.findPostByOwnerId(user.id);
        return post.filter((post) => post.nftId == id && post.addressCollection == addressCollection);
    }

    // Collection Service





    @Get("/collection")
    async getAllCollection() {
        return await queryAllCollectionFactory();
    }
    @Get("/collection/:addressCollection")
    async getNftsByCollection(@Param("addressCollection") addressCollectionRaw: string) {

        const addressCollection = addressCollectionRaw.toLowerCase();
        if (addressCollection == process.env.COLLECTION_ADDRESS.toLowerCase()) {
            throw new BadRequestException(`This is a next hype collection`);
        }
        const deployer = await queryAllCollectionByAddressAPI(addressCollection);
        const addressCheckSum = await Web3.utils.toChecksumAddress(deployer)
        const wallet = await fetchWalletByAddress(addressCheckSum);

        const listNftId = await this.nftService.findListNftIdByAddressCollection(addressCollection) ?? [];
        const listInfoNft = await this.nftService.findNftsByListObjectIdWithCollection(listNftId.map(id => ({ id, addressCollection }))) ?? [];
        if (!wallet.data.address) {
            throw new BadRequestException(`Wallet does not exist in Node`);
        }
        const userInfo = await this.userService.findUserByEmail(wallet.data.owner);

        const mappingPrice = await Promise.all(listInfoNft.map(async (nft) => {
            const price: Array<BN> = await getTokenPrice(nft.addressCollection, String(nft.id))
            const promptPrice: Array<BN> = await getPromptPrice(nft.addressCollection, String(nft.id))
            const listAllower = await queryListAllower(nft.addressCollection, nft.id);
            const listBoughts = await queryPromptBuyerByTokenAndAddress(nft.addressCollection, nft.id);
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
                    address: wallet.data.address,
                },
                promptPrice: {
                    avax: promptPrice[0].toString(),
                    usd: promptPrice[1].toString(),
                },
                promptBuyer: listBoughts,
                addressCollection: nft.addressCollection,
                promptAllower: listAllower,
                attributes: nft.attributes,
            };
        }));

        return {
            user: {
                id: userInfo.id ?? "",
                name: userInfo.name ?? "",
                email: userInfo.email ?? "",
                picture: userInfo.picture ?? "",
                address: deployer
            },
            nft: mappingPrice,
        };
    }
    @Get("/owner/collection")
    async getMyCollection(@Headers('Authorization') accessToken: string) {
        const user = await verifyAccessToken(accessToken);
        const wallet = await fetchWalletByAddress(user.email);
        if (!wallet) {
            throw new BadRequestException(`Wallet does not exist`);
        }
        const listNftId = await queryAllCollectionByDeployerAPI(wallet.data.address);
        return listNftId;
    }

    @Get("/owner/:id")
    async getNftsByOwnerId(@Param("id") id: string): Promise<any> {
        const user = await this.userService.findUserById(id);
        const wallet = await fetchWalletByAddress(user.email);
        if (!wallet) {
            return [];
        }
        const listCollection = await this.nftService.getAllListCollection();

        const listNftCollection: NftCollection[] = await Promise.all(
            listCollection.map(async (addressCollection: string) => {
                const nfts = await queryNFTsByAddress(wallet.data.address, addressCollection);
                return nfts.map((id) => ({
                    id: id,
                    addressCollection: addressCollection,
                }));
            })
        ).then((nestedArrays) => nestedArrays.flat());

        const listInfoNft = await this.nftService.findNftsByListObjectIdWithCollection(listNftCollection);

        const mappingPrice = listInfoNft.map(async (nft) => {
            const price: Array<BN> = await getTokenPrice(nft.addressCollection, String(nft.id))
            const promptPrice: Array<BN> = await getPromptPrice(nft.addressCollection, String(nft.id))
            const listAllower = await queryListAllower(nft.addressCollection, nft.id);
            const listBoughts = await queryPromptBuyerByTokenAndAddress(nft.addressCollection, nft.id);

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
                promptBuyer: listBoughts,
                addressCollection: nft.addressCollection,
                promptAllower: listAllower,
                attributes: nft.attributes,
            };
        })

        return mappingPrice
    }

    @Get("/subscribing")
    async getSubscribingByListUserId(@Body() listUserId: Array<string>) {
        try {
            const results = await Promise.all(
                listUserId.map(async (userId) => {
                    const user = await this.userService.findUserById(userId);
                    const wallet = await fetchWalletByAddress(user.email);

                    if (wallet.data.address) {
                        const listSubscribing: Array<ExportSubscribing> = await querySubscribingAPI(wallet.data.address);
                        return {
                            userId: userId,
                            listSubscribing: listSubscribing,
                        };
                    }
                })
            );

            return results;
        } catch (error) {
            console.error("Error in getSubscribingByListUserId:", error);
            return { error: "Internal server error" };
        }
    }

    @Get("/premium/user/:id")
    async getTokenAddress(@Param("id") id: string) {
        try {
            const user = await this.userService.findUserById(id);
            const wallet = await fetchWalletByAddress(user.email);
            if (!wallet.data.address) {
                throw new BadRequestException(`Wallet does not exist`);
            }
            return await getTokenAddressByUserAddress(wallet.data.address);
        }
        catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Get(":id/collection/:addressCollection")
    async getNftById(@Param("id") id: number, @Param("addressCollection") addressCollectionRaw: string) {
        const addressCollection = addressCollectionRaw.toLowerCase();
        const nfts = await this.nftService.findNftByIdAndAddressCollection(id, addressCollection);
        if (!nfts) {
            throw new BadRequestException(`Nft does not exist`);
        }
        const addressOwner: string = await ownerOf(id, addressCollection);
        const wallet = await fetchWalletByAddress(addressOwner);
        if (!wallet) {
            throw new BadRequestException(`Wallet does not exist`);
        }
        const price: Array<BN> = await getTokenPrice(nfts.addressCollection, String(nfts.id))
        const promptPrice: Array<BN> = await getPromptPrice(nfts.addressCollection, String(nfts.id))
        const ownerInfo = await this.userService.findUserByEmail(wallet.data.owner);
        const listAllower = await queryListAllower(nfts.addressCollection, nfts.id);
        const listBoughts = await queryPromptBuyerByTokenAndAddress(nfts.addressCollection, nfts.id);

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
            promptBuyer: listBoughts,
            addressCollection: nfts.addressCollection,
            promptAllower: listAllower,
            attributes: nfts.attributes,
        };

    }
}