import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateNftDto {
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @IsNumber()
    @IsNotEmpty()
    ownerId: number;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    thumbnail: string;

    @IsBoolean()
    @IsNotEmpty()
    onSale: boolean;

    @IsBoolean()
    @IsNotEmpty()
    publicPrompt: Boolean;

    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsString()
    @IsNotEmpty()
    promptPrice: string;

    @IsArray()
    @IsNotEmpty()
    promptBuyer: string[];
}