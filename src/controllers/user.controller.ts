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
  async getUserById(@Param("id") id: number) {
    const info = await this.userService.findUserById(id);
    const wallet = await this.walletService.findWalletById(id);
    const socialUser = await this.socialUserService.findSocialUserById(id);
    return { ...info, ...wallet, ...socialUser };
  }

  @Get()
  async getAllUsers() {
    const info = await this.userService.findAll()
    const wallet = await this.walletService.findAll()
    const socialUser = await this.socialUserService.findAll()
    return info.map((user) => {
      const walletUser = wallet.find((wallet) => wallet.id === user.id)
      const socialUserUser = socialUser.find((socialUser) => socialUser.id === user.id)
      return { ...user, ...walletUser, ...socialUserUser }
    })
  }

  @Get("/list/:ids")
  async getUserByListId(@Param("ids") ids: string) {
    const listId = ids.split(",").map((id) => parseInt(id))
    const info = await this.userService.findUserByListId(listId);
    const wallet = await this.walletService.findWalletByListId(listId);
    const socialUser = await this.socialUserService.findSocialUserByListId(listId);
    return info.map((user) => {
      const walletUser = wallet.find((wallet) => wallet.id === user.id)
      const socialUserUser = socialUser.find((socialUser) => socialUser.id === user.id)
      return { ...user, ...walletUser, ...socialUserUser }
    })
  }
}