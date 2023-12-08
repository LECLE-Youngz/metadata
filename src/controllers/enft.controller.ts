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
import { DataService, ENftService, NftService, PostService, UserService } from "src/services";
import { Nft } from "src/schemas";
import { verifyAccessToken } from "src/auth/google.verifier";
import { fetchWalletByAddress, getPromptPrice, getTokenPrice, ownerOf, querySubscribingAPI, querySubscriberAPI, queryListAllower, queryPromptBuyerByTokenAndAddress, queryAllNFTsByAddressAndCollection, queryAllCollectionFactory, ownerCollection, queryAllCollectionByDeployerAPI, queryAllCollectionByAddressAPI, getTokenAddressByUserAddress, getCollectionByDeployer } from "src/api";

import * as dotenv from "dotenv";
dotenv.config();

import BN from "bn.js"

@Controller("api/v1/enfts")
export class ENftController {

    constructor(
        private readonly userService: UserService,
        private readonly eNftService: ENftService
    ) { }

    @Get()
    async getAllENfts(@Headers("authorization") authorization: string) {
        const nfts = await this.eNftService.findAll();
        const nftsWithOwners = await Promise.all(
            nfts.map(async (nft) => {
                const user = await verifyAccessToken(authorization);
                const wallet = await fetchWalletByAddress(user.email);
                if (!wallet.data.owner) {
                    throw new BadRequestException(`Wallet does not exist`);
                }
                const deployer = await queryAllCollectionByAddressAPI(nft.addressCollection);
                const subscriber = await querySubscriberAPI(deployer);
                if (subscriber.includes(wallet.data.owner.toLocaleLowerCase())) {
                    const userInfo = await this.userService.findUserByEmail(wallet.data.owner);
                    const price: Array<BN> = await getTokenPrice(nft.addressCollection, String(nft.id))
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
                            address: deployer,
                        },
                        addressCollection: nft.addressCollection,
                        attributes: nft.attributes,
                        meta: nft.meta,
                    };
                }
            })
        );

        return nftsWithOwners
    }


    @Get("/collection")
    async getAllCollection() {
        const listCollection = await this.eNftService.getAllCollection();
        return listCollection;
    }


    @Get("/collection/:id")
    async getNftByAddressCollection(@Param("id") id: string, @Headers("authorization") authorization: string) {
        const userDeployer = await this.userService.findUserById(id);
        const walletDeployer = await fetchWalletByAddress(userDeployer.email);
        if (!walletDeployer.data.owner) {
            throw new BadRequestException(`Wallet does not exist`);
        }
        const deployer = walletDeployer.data.address;
        const addressCollection = await getCollectionByDeployer(deployer);
        const listNftId = await this.eNftService.getENftByAddressCollection(addressCollection);
        const listNft = await Promise.all(listNftId.map(async (id) => {
            const nft = await this.eNftService.findENftByIdAndAddressCollection(id, addressCollection);
            const user = await verifyAccessToken(authorization);
            const walletUser = await fetchWalletByAddress(user.email);
            if (!walletUser.data.owner) {
                throw new BadRequestException(`Wallet does not exist`);
            }
            const listSubscriber = await querySubscriberAPI(deployer);
            if (listSubscriber.includes(walletUser.data.address.toLocaleLowerCase()) || walletUser.data.address.toLocaleLowerCase() === deployer.toLocaleLowerCase()) {
                const price: Array<BN> = await getTokenPrice(nft.addressCollection, String(nft.id))
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
                        id: userDeployer.id,
                        name: userDeployer.name,
                        email: userDeployer.email,
                        picture: userDeployer.picture,
                        address: addressCollection,
                    },
                    addressCollection: nft.addressCollection,
                    attributes: nft.attributes,
                    meta: nft.meta,
                };
            }
        }))
        return listNft;
    }
}