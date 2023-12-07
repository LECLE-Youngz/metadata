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
import { fetchWalletByAddress, getPromptPrice, getTokenPrice, ownerOf, querySubscribingAPI, querySubscriberAPI, queryNFTsByAddress, queryListAllower, queryPromptBuyerByTokenAndAddress, queryAllNFTsByAddressAndCollection, queryAllCollectionFactory, ownerCollection, queryAllCollectionByDeployerAPI, queryAllCollectionByAddressAPI, getTokenAddressByUserAddress } from "src/api";

import * as dotenv from "dotenv";
dotenv.config();

import BN from "bn.js"
import Web3 from "web3";

@Controller("api/v1/nfts")
export class NftController {

    constructor(
        private readonly userService: UserService,
        private readonly eNftService: ENftService,
    ) { }


    @Get("/collection")
    async getAllCollection() {
        const listCollection = await this.eNftService.getAllCollection();
        return listCollection;
    }

    @Get("/collection/:addressCollection")
    async getNftByAddressCollection(@Param("addressCollection") addressCollectionRaw: string) {
        const addressCollection = addressCollectionRaw.toLowerCase();
        const listNftId = await this.eNftService.getENftByAddressCollection(addressCollection);
        const listNft = await Promise.all(listNftId.map(async (id) => {
            const nft = await this.eNftService.findENftByIdAndAddressCollection(id, addressCollection);
            const addressOwner: string = await ownerOf(nft.id, nft.addressCollection);
            const wallet = await fetchWalletByAddress(addressOwner);
            if (wallet) {
                const userInfo = await this.userService.findUserByEmail(wallet.data.owner);
                const price: Array<BN> = await getTokenPrice(nft.addressCollection, String(nft.id))
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
                    promptBuyer: listBoughts,
                    addressCollection: nft.addressCollection,
                    promptAllower: listAllower,
                    attributes: nft.attributes,
                    meta: nft.meta,
                };
            }
        }))
        return listNft;
    }


    @Get(":id/collection/:addressCollection")
    async getNftById(@Param("id") id: number, @Param("addressCollection") addressCollectionRaw: string) {
        const addressCollection = addressCollectionRaw.toLowerCase();
        const nfts = await this.eNftService.findENftByIdAndAddressCollection(id, addressCollection);
        if (!nfts) {
            throw new BadRequestException(`Nft does not exist`);
        }
        const addressOwner: string = await ownerOf(id, addressCollection);
        const wallet = await fetchWalletByAddress(addressOwner);
        if (!wallet) {
            throw new BadRequestException(`Wallet does not exist`);
        }
        const price: Array<BN> = await getTokenPrice(nfts.addressCollection, String(nfts.id))
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
            promptBuyer: listBoughts,
            addressCollection: nfts.addressCollection,
            promptAllower: listAllower,
            attributes: nfts.attributes,
            meta: nfts.meta,
        };

    }
}