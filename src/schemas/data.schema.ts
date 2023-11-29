import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type DataDocument = HydratedDocument<Data>;

export class Metadata {
    H: number;
    W: number;
    enable_attention_slicing: string;
    file_prefix: string;
    guidance_scale: number;
    instant_response: string;
    model: string;
    n_samples: number;
    negative_prompt: string;
    outdir: string;
    prompt: string;
    revision: string;
    safetychecker: string;
    seed: number;
    steps: number;
    vae: string;
}

@Schema()
export class Data {
    @Prop({ required: true, unique: true, index: true })
    id: number;

    @Prop({ required: true })
    meta: Metadata;
}

export const DataSchema = SchemaFactory.createForClass(Data);