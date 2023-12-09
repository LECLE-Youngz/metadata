import { IsNotEmpty, IsNumber, IsObject, IsString } from "class-validator";
import { Metadata } from "src/schemas";

export class CreateNftDto {
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    image: string;

    @IsString()
    @IsNotEmpty()
    addressCollection: string;

    @IsObject()
    @IsNotEmpty()
    meta: Metadata;

    @IsString()
    @IsNotEmpty()
    type: string;
}
