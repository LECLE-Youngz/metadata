import { IsArray, IsNotEmpty, IsNumber, IsString, IsBoolean } from "class-validator";

export class UpdateNumNftDto {
    @IsNumber()
    @IsNotEmpty()
    nftId: number;

    @IsString()
    @IsNotEmpty()
    addressCollection: string;
}

export class UpdateNumPromptDto {
    @IsNumber()
    @IsNotEmpty()
    nftId: number;

    @IsString()
    @IsNotEmpty()
    addressCollection: string;
}