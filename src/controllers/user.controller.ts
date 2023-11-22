import {
  BadRequestException,
  Controller,
  Get,
  Param,
} from "@nestjs/common";

import { UserService, WalletService, SocialUserService, NftService } from "src/services";
import { User } from "src/schemas";

@Controller("api/v1/users")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly walletService: WalletService,
    private readonly socialUserService: SocialUserService,
    private readonly nftService: NftService
  ) { }

  @Get(":id")
  async getUserById(@Param("id") id: string) {
    const info = await this.userService.findUserById(id);
    const wallet = await this.walletService.findWalletById(info.id);
    const socialUser = await this.socialUserService.findSocialUserById(info.id);
    const listUserByFlowing = await this.userService.findUserByListId(socialUser?.following || []);
    const listUserByFlowers = await this.userService.findUserByListId(socialUser?.follower || []);
    const nft = await this.nftService.findNftsByOwnerId(info.id);

    // Mapping the data

    const mappedData = {
      id: info.id,
      name: info.name,
      family_name: info.family_name,
      given_name: info.given_name,
      email: info.email,
      locale: info.locale,
      wallet: {
        address: wallet.address,
      },
      socialUser: {
        following: listUserByFlowing?.map((user) => {
          return {
            id: user.id,
            name: user.name,
          };
        }) || [],
        followers: listUserByFlowers?.map((user) => {
          return {
            id: user.id,
            name: user.name,
          };
        }) || [],
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

  @Get()
  async getAllUsers() {
    const info = await this.userService.findAll();
    return info.map((user) => user.id);
  }

  // get wallet by email 
  @Get("/wallet/:email")
  async getWalletByEmail(@Param("email") email: string) {
    const user = await this.userService.findUserByEmail(email);
    const wallet = await this.walletService.findWalletById(user.id);
    return {
      id: user.id,
      email: user.email,
      address: wallet.address,
    };
  }

}