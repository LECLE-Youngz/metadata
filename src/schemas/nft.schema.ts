import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type NftDocument = HydratedDocument<Nft>;

export class Attribute {
    trait_type: string;
    value: string;
}

@Schema()
export class Nft {
    @Prop({ required: true, unique: true, index: true, sparse: true })
    id: number;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    image: string;

    @Prop({ required: true })
    addressCollection: string;

    @Prop({ required: true })
    attributes: Array<Attribute>;
}

export const NftSchema = SchemaFactory.createForClass(Nft);