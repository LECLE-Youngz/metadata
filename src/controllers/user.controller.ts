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
    const info = await this.userService.findUserById(id);
    const socialUser = await this.socialUserService.findSocialUserById(info.id);
    const nft = await this.nftService.findNftsByOwnerId(info.id);

    // Mapping the data

    const mappedData = {
      id: info.id,
      name: info.name,
      family_name: info.family_name,
      given_name: info.given_name,
      email: info.email,
      locale: info.locale,
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
      picture: info.picture,
      nft: nft ? nft : [],

    };

    return mappedData;
  }

}