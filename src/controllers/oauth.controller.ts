import {
    BadRequestException,
    Body, Controller, Post,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OAuth2Client } from "google-auth-library";
import { SocialUserService, UserService } from "src/services";
import { User } from "src/schemas";
import { verifyAccessToken } from "src/auth/google.verifier";

@Controller("api/v1/oauth")
export class OauthController {
    oAuth2Client: OAuth2Client

    constructor(
        private configService: ConfigService,
        private readonly userService: UserService,
        private readonly socialUserService: SocialUserService
    ) {
        this.oAuth2Client = new OAuth2Client(
            this.configService.get<string>("ggClientId"),
            this.configService.get<string>("ggClientSecret"),
            "postmessage"
        );
    }

    @Post("/google")
    async getOauth(@Body("code") code: string) {
        try {
            if (!code) {
                throw new BadRequestException("Missing code");
            }
            const { tokens } = await this.oAuth2Client.getToken(code);
            const { access_token } = tokens;
            const user: User = await verifyAccessToken(`Bearer ${access_token}`);
            const existedUser = await this.userService.findUserById(user.id);

            if (!existedUser) {
                await this.userService.createUser(user);
                const socialUser = await this.socialUserService.createSocialUser(user.id);
                return {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        picture: user.picture,
                        locale: user.locale,
                        verified_email: user.verified_email,
                        family_name: user.family_name,
                        given_name: user.given_name
                    },
                    socialUser: {
                        bookmarks: socialUser.bookmarks,
                        following: socialUser.following,
                        follower: socialUser.follower,
                        numSold: socialUser.numSold,
                        numPurchased: socialUser.numPurchased,
                        numPromptSold: socialUser.numPromptSold,
                        numPromptPurchased: socialUser.numPromptPurchased
                    },
                    tokens: tokens
                }
            }
            else {

                let socialUser = await this.socialUserService.findSocialUserById(user.id);
                if (!socialUser) {
                    socialUser = await this.socialUserService.createSocialUser(user.id);
                }
                socialUser = await this.socialUserService.findSocialUserById(user.id);

                if (existedUser.picture !== user.picture || existedUser.name !== user.name ||
                    existedUser.locale !== user.locale || existedUser.verified_email !== user.verified_email ||
                    existedUser.family_name !== user.family_name || existedUser.given_name !== user.given_name
                )
                    await this.userService.updateUser(user);

                return {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        picture: user.picture,
                        locale: user.locale,
                        verified_email: user.verified_email,
                        family_name: user.family_name,
                        given_name: user.given_name
                    },
                    socialUser: {
                        bookmarks: socialUser.bookmarks ?? [],
                        following: socialUser.following ?? [],
                        follower: socialUser.follower ?? [],
                        numSold: socialUser.numSold ?? 0,
                        numPurchased: socialUser.numPurchased ?? 0,
                        numPromptSold: socialUser.numPromptSold ?? 0,
                        numPromptPurchased: socialUser.numPromptPurchased ?? 0
                    },
                    tokens: tokens
                }

            }
        }
        catch (err) {
            console.log(err);
            throw new BadRequestException(err.message);
        }
    }
}