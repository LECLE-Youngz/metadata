import {
  Controller,
  Get,
  Param,
} from "@nestjs/common";

import { UserService, WalletService, SocialUserService } from "src/services";
import { User } from "src/schemas";

@Controller("api/v1/users")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly walletService: WalletService,
    private readonly socialUserService: SocialUserService
  ) { }

  @Get(":id")
  async getUserById(@Param("id") id: string) {
    const info = await this.userService.findUserById(id);
    const wallet = await this.walletService.findWalletById(info.id);
    const socialUser = await this.socialUserService.findSocialUserById(info.id);
    const listUserByFlowing = await this.userService.findUserByListId(socialUser.following)
    const listUserByFlowers = await this.userService.findUserByListId(socialUser.follower)
    return { info: info, wallet: wallet, listUserFlowing: listUserByFlowing, listUserByFlowers: listUserByFlowers }
  }

  @Get()
  async getAllUsers() {
    const info = await this.userService.findAll()
    const wallet = await this.walletService.findAll()
    const socialUser = await this.socialUserService.findAll()
    return { info: info, wallet: wallet, socialUser: socialUser }
  }

}