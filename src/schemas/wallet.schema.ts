import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type WalletDocument = HydratedDocument<Wallet>;


@Schema()
export class Wallet {
    @Prop({ required: true, unique: true, index: true, sparse: true })
    id: number;

    @Prop({ required: true, unique: true, index: true })
    address: string;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);