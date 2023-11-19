import {
    Body, Controller, Post,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OAuth2Client } from "google-auth-library";
import { GetTokenResponse } from "google-auth-library/build/src/auth/oauth2client";
import { UserService } from "../services";
import { User } from "../schemas";
import { verifyAccessToken } from "../auth/google.verifier";


@Controller("/oauth")
export class OauthController {
    oAuth2Client: OAuth2Client
    constructor(private configService: ConfigService, private readonly userService: UserService) {
        this.oAuth2Client = new OAuth2Client(
            this.configService.get<string>("ggClientId"),
            this.configService.get<string>("ggClientSecret"),
            "postmessage"
        );
    }

    @Post("/google")
    async getOauth(@Body("code") code: string): Promise<GetTokenResponse["tokens"]> {
        const { tokens } = await this.oAuth2Client.getToken(code);
        const { access_token } = tokens;
        const user: User = await verifyAccessToken(`Bearer ${access_token}`);
        const existedUser = await this.userService.findUserById(user.id);
        if (!existedUser) {
            await this.userService.createUser(user);
        }
        else {
            if (existedUser.picture !== user.picture || existedUser.name !== user.name ||
                existedUser.locale !== user.locale || existedUser.verified_email !== user.verified_email ||
                existedUser.family_name !== user.family_name || existedUser.given_name !== user.given_name
            )
                await this.userService.updateUser(user);
            else return tokens;
        }
        return tokens;
    }
}