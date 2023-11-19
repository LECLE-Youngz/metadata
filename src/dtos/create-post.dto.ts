import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreatePostDto {
    @IsNumber()
    @IsNotEmpty()
    ownerId: number;

    @IsString()
    @IsNotEmpty()
    text: string;
}