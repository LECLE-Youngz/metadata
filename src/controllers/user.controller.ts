import {
  Controller,
  Get,
  Param,
} from "@nestjs/common";

import { UserService } from "src/services";
import { User } from "src/schemas";

@Controller("api/v1/users")
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get(":id")
  async getUserById(@Param("id") id: number): Promise<User> {
    return await this.userService.findUserById(id);
  }

  @Get()
  async getAllUsers(): Promise<Array<User>> {
    return await this.userService.findAll()
  }
}