import { IsArray, IsNotEmpty, IsNumber, IsString, IsBoolean } from "class-validator";

export class UpdateNumNftDto {
    @IsNumber()
    nftId: number;

    @IsString()
    addressCollection: string;
}

export class UpdateNumPromptDto {
    @IsNumber()
    nftId: number;

    @IsString()
    addressCollection: string;
}