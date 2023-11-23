import { IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class UpdatePostDto {

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

    @IsArray()
    @IsNotEmpty()
    tags: Array<string>;
}