import { Type } from "class-transformer";
import { IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsString, ValidateNested } from "class-validator";

class MetadataDto {
    @IsNumber()
    @IsNotEmpty()
    H: number;

    @IsNumber()
    @IsNotEmpty()
    W: number;

    @IsString()
    @IsNotEmpty()
    enable_attention_slicing: string;

    @IsString()
    @IsNotEmpty()
    file_prefix: string;

    @IsNumber()
    @IsNotEmpty()
    guidance_scale: number;

    @IsString()
    @IsNotEmpty()
    instant_response: string;

    @IsString()
    @IsNotEmpty()
    model: string;

    @IsNumber()
    @IsNotEmpty()
    n_samples: number;

    @IsString()
    @IsNotEmpty()
    negative_prompt: string;

    @IsString()
    @IsNotEmpty()
    outdir: string;

    @IsString()
    @IsNotEmpty()
    prompt: string;

    @IsString()
    @IsNotEmpty()
    revision: string;

    @IsString()
    @IsNotEmpty()
    safetychecker: string;

    @IsNumber()
    @IsNotEmpty()
    seed: number;

    @IsNumber()
    @IsNotEmpty()
    steps: number;

    @IsString()
    @IsNotEmpty()
    vae: string;
}

export class CreateDataDto {
    @IsString()
    @IsNotEmpty()
    readonly id: number;

    @IsString()
    @IsNotEmpty()
    readonly addressCollection: string;

    @IsObject()
    @IsNotEmptyObject()
    @ValidateNested()
    @Type(() => MetadataDto)
    @IsNotEmpty()
    readonly meta: MetadataDto;
}