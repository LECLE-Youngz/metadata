import {
  BadRequestException,
  Controller,
  Get,
  Param,
} from "@nestjs/common";
import gaxios, { GaxiosResponse } from "gaxios";
import { fetchWalletByAddress } from "src/api";

import { UserService, SocialUserService, NftService } from "src/services";
import { ResponseWallet } from "src/types";

import { NftCollection } from "src/types";
import { queryNFTsByAddress } from "src/api/graph";
import BN from "bn.js"

import { getTokenPrice, getPromptPrice } from "src/api";


@Controller("api/v1/users")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly socialUserService: SocialUserService,
    private readonly nftService: NftService
  ) { }



  @Get()
  async getAllUsers() {
    const info = await this.userService.findAll();
    return info.map((user) => user.id);
  }

  @Get("/address/:address")
  async getWalletByEmail(@Param("address") address: string) {
    const wallet: GaxiosResponse<ResponseWallet> = await fetchWalletByAddress(address);
    if (!wallet.data?.owner) {
      throw new BadRequestException("Wallet not found");
    }
    const user = await this.userService.findUserByEmail(wallet.data?.owner);
    if (!user) {
      throw new BadRequestException("User not found");
    }
    return user;
  }

  @Get(":id")
  async getUserById(@Param("id") id: string) {
    const user = await this.userService.findUserById(id);
    const socialUser = await this.socialUserService.findSocialUserById(user.id);
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
    // Mapping the data

    const mappedData = {
      id: user.id,
      name: user.name,
      family_name: user.family_name,
      given_name: user.given_name,
      email: user.email,
      locale: user.locale,
      socialUser: {
        following: socialUser.following || [],
        followers: socialUser.follower || [],
        subscribers: [],
        subscribing: [],
        bookmarks: socialUser?.bookmarks || [],
        numNFTSold: socialUser.numSold || 0,
        numNFTPurchased: socialUser.numPurchased || 0,
        numPromptSold: socialUser.numPromptSold || 0,
        numPromptPurchased: socialUser.numPromptPurchased || 0
      },
      picture: user.picture,
      nft: mappingPrice ? mappingPrice : [],

    };

    return mappedData;
  }

}