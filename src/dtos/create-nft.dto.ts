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

    @IsString()
    @IsNotEmpty()
    price: string;

    @IsString()
    @IsNotEmpty()
    promptPrice: string;

    @IsArray()
    @IsNotEmpty()
    promptBuyer: string[];

    @IsArray()
    @IsNotEmpty()
    promptAllower: string[];

    @IsString()
    @IsNotEmpty()
    addressCollection: string;

    @IsObject()
    @IsNotEmpty()
    meta: Metadata;
}