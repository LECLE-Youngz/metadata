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
import { queryNFTsByAddress, queryPromptBuyerByTokenAndAddress, queryListAllower, queryAllNFTsByAddressAndCollection, querySubscriberAPI, querySubscribingAPI, getCreatorStatusAPI } from "src/api/the-graph";
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
    try {
      const user = await this.userService.findUserById(id) ?? await this.userService.findUserByEmail(id);
      const socialUser = await this.socialUserService.findSocialUserById(user.id);
      const wallet = await fetchWalletByAddress(user.email);
      if (!wallet) {
        return [];
      }
      const statusCreator = await getCreatorStatusAPI(wallet.data.address)

      // Mapping the data
      const listNftCollectionByAddress = await queryAllNFTsByAddressAndCollection(wallet.data.address) ?? []
      const mappingPrice = listNftCollectionByAddress.map(async (nft) => {
        const price: Array<BN> = await getTokenPrice(nft.contract, String(nft.tokenId))
        const promptPrice: Array<BN> = await getPromptPrice(nft.contract, String(nft.tokenId))
        const listBoughts = await queryPromptBuyerByTokenAndAddress(nft.contract, nft.tokenId) ?? [];
        const listAllower = await queryListAllower(nft.contract, nft.tokenId) ?? [];
        const nftInfo = await this.nftService.findNftByIdAndAddressCollection(Number(nft.tokenId), nft.contract);
        return {
          id: nft.tokenId,
          name: nftInfo?.name ?? "",
          description: nftInfo?.description ?? "",
          image: nftInfo?.image ?? "",
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
          addressCollection: nft.contract,
          promptAllower: listAllower,
          attributes: nftInfo?.attributes ?? [],
        };
      })
      // filter nft with wallet.data.address is owner

      const listSubscribing = await querySubscribingAPI(wallet.data.address) ?? [];
      const listSubscriber = await querySubscriberAPI(wallet.data.address) ?? [];
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
          subscribers: statusCreator ? listSubscriber : null,
          subscribing: listSubscribing || [],
          bookmarks: socialUser?.bookmarks || [],
          numNFTSold: socialUser.numSold || 0,
          numNFTPurchased: socialUser.numPurchased || 0,
          numPromptSold: socialUser.numPromptSold || 0,
          numPromptPurchased: socialUser.numPromptPurchased || 0
        },
        picture: user.picture,
        nfts: await Promise.all(mappingPrice),
      };

      return mappedData;
    }
    catch (err) {
      throw new BadRequestException(err.message)
    }
  }
}