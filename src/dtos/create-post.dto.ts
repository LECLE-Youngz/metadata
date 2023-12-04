import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreatePostDto {

    @IsString()
    @IsNotEmpty()
    header: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    text: string;

    @IsNumber()
    @IsNotEmpty()
    nftId: number;

    @IsString()
    @IsNotEmpty()
    addressCollection: string;

    @IsArray()
    @IsNotEmpty()
    tags: Array<string>;

    @IsBoolean()
    @IsNotEmpty()
    exlusiveConent: boolean;
}