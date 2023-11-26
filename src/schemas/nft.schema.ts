import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type NftDocument = HydratedDocument<Nft>;

@Schema()
export class Nft {
    @Prop({ required: true, unique: true, index: true, sparse: true })
    id: number;

    @Prop({ required: true })
    ownerId: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    thumbnail: string;

    @Prop({ required: true })
    price: string;

    @Prop({ required: true })
    promptPrice: string;

    @Prop({ required: true })
    promptBuyer: string[];
}

export const NftSchema = SchemaFactory.createForClass(Nft);