import {
    BadRequestException,
    Body, Controller, Post,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OAuth2Client } from "google-auth-library";
import { GetTokenResponse } from "google-auth-library/build/src/auth/oauth2client";
import { SocialUserService, UserService, WalletService } from "src/services";
import { User } from "src/schemas";
import { verifyAccessToken } from "src/auth/google.verifier";

@Controller("api/v1/oauth")
export class OauthController {
    oAuth2Client: OAuth2Client

    constructor(
        private configService: ConfigService,
        private readonly userService: UserService,
        private readonly walletService: WalletService,
        private readonly socialUserService: SocialUserService
    ) {
        this.oAuth2Client = new OAuth2Client(
            this.configService.get<string>("ggClientId"),
            this.configService.get<string>("ggClientSecret"),
            "postmessage"
        );
    }

    @Post("/google")
    async getOauth(@Body("code") code: string, @Body("address") address: string) {
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
                const wallet = await this.walletService.createWallet(user.id, address);
                const socialUser = await this.socialUserService.initSocialUser(user.id);
                return {
                    info: { ...user },
                    socialUser: { ...socialUser },
                    wallet: { ...wallet },
                    tokens: { ...tokens },
                }
            }
            else {

                const wallet = await this.walletService.findWalletById(user.id);
                if (!wallet)
                    await this.walletService.createWallet(user.id, address);

                const socialUser = await this.socialUserService.findSocialUserById(user.id);

                if (existedUser.picture !== user.picture || existedUser.name !== user.name ||
                    existedUser.locale !== user.locale || existedUser.verified_email !== user.verified_email ||
                    existedUser.family_name !== user.family_name || existedUser.given_name !== user.given_name
                )
                    await this.userService.updateUser(user);


                if (!socialUser)
                    await this.socialUserService.initSocialUser(user.id);

                if (wallet && wallet.address !== address)
                    await this.walletService.updateWallet(user.id, address);

                return {
                    info: { ...user },
                    socialUser: { ...socialUser },
                    wallet: { ...wallet },
                    tokens: { ...tokens },
                }
            }
        }
        catch (err) {
            console.log(err);
            throw new BadRequestException(err.message);
        }
    }
}