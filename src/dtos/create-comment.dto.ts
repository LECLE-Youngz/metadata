import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCommentDto {
    @IsNumber()
    @IsNotEmpty()
    postId: number;

    @IsNumber()
    @IsNotEmpty()
    ownerId: number;

    @IsString()
    @IsNotEmpty()
    text: string;
}