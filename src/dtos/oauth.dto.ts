import { IsNotEmpty, IsNumber, IsObject, IsString } from "class-validator";
import { Credentials } from "google-auth-library";
import { User, SocialUser } from "../schemas";
export class OauthDto {
    @IsString()
    @IsNotEmpty()
    tokens: Credentials;

    @IsObject()
    @IsNotEmpty()
    user: User;

    @IsObject()
    @IsNotEmpty()
    socialUser: SocialUser;
}