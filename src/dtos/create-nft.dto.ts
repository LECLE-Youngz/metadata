import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsObject, IsString } from "class-validator";
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
    thumbnail: string;

    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsString()
    @IsNotEmpty()
    promptPrice: number;

    @IsArray()
    @IsNotEmpty()
    promptBuyer: string[];

    @IsObject()
    @IsNotEmpty()
    meta: Metadata;
}