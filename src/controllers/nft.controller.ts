import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    Headers,
    BadRequestException,
    Put,
} from "@nestjs/common";
import { ExportSubscribing, NftCollection } from "src/types";

import { CreateNftDto } from "src/dtos";
import { DataService, ENftService, NftService, PostService, SocialUserService, UserService } from "src/services";
import { Nft } from "src/schemas";
import { verifyAccessToken } from "src/auth/google.verifier";
import { fetchWalletByAddress, getPromptPrice, getTokenPrice, ownerOf, querySubscribingAPI, querySubscriberAPI, queryNFTsByAddress, queryListAllower, queryPromptBuyerByTokenAndAddress, queryAllNFTsByAddressAndCollection, queryAllCollectionFactory, ownerCollection, queryAllCollectionByDeployerAPI, queryAllCollectionByAddressAPI, getTokenAddressByUserAddress, getExclusiveNFTCollection, getCollectionByDeployer, queryAllCollectionByAddressWithoutExclusiveAPI, queryEventByDeployerAPI, queryEventByAddressAPI, queryAllEventAPI, queryOwnerByCollectionAPI, queryTagByCollectionAPI, queryEventAddressByDeployerAPI } from "src/api";

import * as dotenv from "dotenv";
dotenv.config();

import BN from "bn.js"
import Web3 from "web3";
import { mysteryEvMax, nftPurchasedRequired } from "src/api/mystery";
import { mysteryDropEvMax } from "src/api/mysteryDrop";

@Controller("api/v1/nfts")
export class NftController {

    constructor(private readonly nftService: NftService,
        private readonly userService: UserService,
        private readonly dataService: DataService,
        private readonly postService: PostService,
        private readonly eNftService: ENftService,
        private readonly socialUserService: SocialUserService,
    ) { }


    @Get()
    async getAllNfts() {
        const nftsCollection = await queryAllCollectionByAddressWithoutExclusiveAPI()
        const listNft = await this.nftService.findNftsByListObjectIdWithCollection(nftsCollection.map(nft => ({ id: Number(nft.tokenId), addressCollection: nft.contract })));
        const nftsWithOwners = await Promise.all(
            listNft.map(async (nft) => {
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
    async createNft(@Body() createNft: CreateNftDto, @Headers('Authorization') accessToken: string) {
        try {
            const user = await verifyAccessToken(accessToken);
            // const wallet = await fetchWalletByAddress(user.email);
            // const addressOwner: string = await ownerOf(createNft.id, createNft.addressCollection);
            // if (addressOwner !== wallet.data.address) {
            //     throw new BadRequestException(`You are not owner of this nft`);
            // }
            // const existedNft = await this.nftService.findNftByIdAndAddressCollection(createNft.id, createNft.addressCollection);
            // if (existedNft) {
            //     throw new BadRequestException(`Nft already exists`);
            // }
            if (createNft.type !== "exclusive") {
                await this.dataService.createData(createNft.id, createNft.addressCollection.toLowerCase(), createNft.meta);

                return await this.nftService.createNft(
                    createNft.id,
                    createNft.name,
                    createNft.description,
                    createNft.image,
                    createNft.addressCollection.toLowerCase(),
                    createNft.type
                );
            } else {
                return await this.eNftService.createENft(
                    createNft.id,
                    createNft.name,
                    createNft.description,
                    createNft.image,
                    createNft.addressCollection.toLowerCase(),
                    createNft.meta,
                );
            }
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

        // console.log(listCollection);

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
        const mappingPrice = await Promise.all(listInfoNft.map(async (nft) => {
            const [price, promptPrice, listAllower, listBoughts] = await Promise.all([
                getTokenPrice(nft.addressCollection, String(nft.id)),
                getPromptPrice(nft.addressCollection, String(nft.id)),
                queryListAllower(nft.addressCollection, nft.id),
                queryPromptBuyerByTokenAndAddress(nft.addressCollection, nft.id),
            ]);

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
        }));

        return mappingPrice;
    }

    @Get("/owner")
    async getOwnerNfts(@Headers('Authorization') accessToken: string) {
        const user = await verifyAccessToken(accessToken);
        const wallet = await fetchWalletByAddress(user.email);
        if (!wallet.data.address) {
            throw new BadRequestException(`Wallet does not exist`);
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
        const mappingPrice = await Promise.all(listInfoNft.map(async (nft) => {
            const [price, promptPrice, listAllower, listBoughts] = await Promise.all([
                getTokenPrice(nft.addressCollection, String(nft.id)),
                getPromptPrice(nft.addressCollection, String(nft.id)),
                queryListAllower(nft.addressCollection, nft.id),
                queryPromptBuyerByTokenAndAddress(nft.addressCollection, nft.id),
            ]);
            return {
                id: nft.id,
                name: nft.name,
                description: nft.description,
                image: nft.image,
                price: {
                    avax: price[0].toString(),
                    usd: price[1].toString(),
                },
                promptPrice: {
                    avax: promptPrice[0].toString(),
                    usd: promptPrice[1].toString(),
                },
                promptBuyer: listBoughts,
                addressCollection: nft.addressCollection,
                promptAllower: listAllower,
                attributes: nft.attributes,
                eNft: false,

            };
        }));
        const addressENft = await getCollectionByDeployer(wallet.data.address);
        if (addressENft) {
            const listDataENft = await this.eNftService.getENftByAddressCollection(addressENft);
            const listDataInfoENft = await this.eNftService.findENftsByListObjectIdWithCollection(listDataENft.map(data => ({ id: data, addressCollection: addressENft })));

            const listDataWithENft = await Promise.all(listDataInfoENft.map(async nft => {
                const price: Array<BN> = await getTokenPrice(nft.addressCollection, String(nft.id))

                return {
                    id: nft.id,
                    addressCollection: nft.addressCollection,
                    name: nft.name,
                    description: nft.description,
                    image: nft.image,
                    price: {
                        avax: price[0].toString(),
                        usd: price[1].toString(),
                    },
                    promptPrice: {
                        avax: "0",
                        usd: "0",
                    },
                    attributes: nft.attributes,
                    promptBuyer: [],
                    promptAllower: [],
                    eNft: true,
                }
            }))
            return listDataWithENft.concat(mappingPrice);
        }
        return mappingPrice;

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

    @Get("/exclusive/user/:id")
    async getExclusiveByUserId(@Param("id") id: string) {
        try {
            const user = await this.userService.findUserById(id);
            const wallet = await fetchWalletByAddress(user.email);
            if (!wallet.data.address) {
                throw new BadRequestException(`Wallet does not exist`);
            }
            return await getExclusiveNFTCollection(wallet.data.address);
        }
        catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Get("/collection/:addressCollection/nft/:id")
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

    @Get("/event/user/:id")
    async getEventById(@Param("id") id: string) {
        const user = await this.userService.findUserById(id);
        const wallet = await fetchWalletByAddress(user.email);
        if (!wallet.data.address) {
            throw new BadRequestException(`Event does not exist`);
        }
        const listCollection = await queryEventByDeployerAPI(wallet.data.address);
        return listCollection;
    }

    @Get("/event/:address")
    async getEventByAddress(@Param("address") address: string) {
        const listCollection = await queryEventByAddressAPI(address);
        return listCollection;
    }

    @Get("/event/:address/nft/:id")
    async getEventNftById(@Param("id") id: number, @Param("address") address: string) {
        const nfts = await this.nftService.findNftByIdAndAddressCollection(id, address);
        if (!nfts) {
            throw new BadRequestException(`Nft does not exist`);
        }
        const addressOwner: string = await ownerOf(id, address);
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

    @Get("/event")
    async getAllEvent(@Headers('Authorization') accessToken: string) {
        const listCollection = await queryAllEventAPI();
        const msgSender = await verifyAccessToken(accessToken);
        const walletSender = await fetchWalletByAddress(msgSender.email);
        if (!walletSender.data.address) {
            throw new BadRequestException(`Wallet does not exist`);
        }
        const listCollectionMappingOwner = await Promise.all(listCollection.map(async (address) => {
            const owner = await queryOwnerByCollectionAPI(address);
            const wallet = await fetchWalletByAddress(Web3.utils.toChecksumAddress(owner));
            if (!wallet.data.address) {
                throw new BadRequestException(`Wallet does not exist`);
            }
            const userInfo = await this.userService.findUserByEmail(wallet.data.owner);
            const tag = await queryTagByCollectionAPI(address)
            const numNftRequire = tag === "mystery" ? (await nftPurchasedRequired(address)) ?? 0 : null;

            let fulfill = "no";
            let maxSupply = null;
            if (tag === "lucky") {
                const listSubscriber = await querySubscriberAPI(wallet.data.address);
                const checkSub = listSubscriber.find(sub => sub === walletSender.data.address.toLowerCase());
                if (checkSub) {
                    fulfill = "yes";
                }
                else {
                    fulfill = "no";

                }
                maxSupply = null;

            }
            else if (
                tag === "mystery"
            ) {
                const count = await this.socialUserService.getNumSoldBuyerWithCreator(walletSender.data.address, wallet.data.address);
                const numberPurchase = await nftPurchasedRequired(address).toString();
                if (count >= Number(numberPurchase)) {
                    fulfill = "yes";
                    maxSupply = await mysteryEvMax(address)
                } else {
                    fulfill = count.toString();
                }
            }
            else if (
                tag === "drop"
            ) {
                fulfill = "no"
                maxSupply = await mysteryDropEvMax(address)
            }
            else if (
                tag === "treasury"
            ) {
                fulfill = "yes"
                maxSupply = null
            }




            return {
                tag: tag,
                owner: {
                    id: userInfo.id,
                    name: userInfo.name,
                },
                fulfill: fulfill,
                maxSupply: maxSupply,
                require: numNftRequire,
                addressCollection: address,
            }
        }))

        return listCollectionMappingOwner;
    }


    @Put("/collection/:addressCollection/type/:type")
    async updateCollection(@Param("addressCollection") addressCollectionRaw: string, @Param("type") type: string, @Headers('Authorization') accessToken: string) {
        const addressCollection = addressCollectionRaw.toLowerCase();
        const user = await verifyAccessToken(accessToken);
        const listNftUpdate = await this.nftService.findNftByAddressCollectionAndType(user.id, type)
        await this.nftService.updateCollectionAndNftIdWithNftAutoCountFrom0(listNftUpdate, addressCollection);
        return "success";
    }

    @Get("count/user/:id/type/:type")
    async getCountNftByType(@Param("type") type: string, @Param("id") id: string) {
        const user = await this.userService.findUserById(id);
        const listNftUpdate = await this.nftService.getNumberByTypeAndCollection(type, user.id);
        return listNftUpdate
    }
}