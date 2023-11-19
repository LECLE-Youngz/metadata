import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreatePostDto {

    @IsString()
    @IsNotEmpty()
    text: string;

    @IsNumber()
    @IsNotEmpty()
    nftId: number;
}