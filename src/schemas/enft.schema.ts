import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { Attribute, Metadata } from "./";
export type ENftDocument = HydratedDocument<ENft>;

@Schema()
export class ENft {
    @Prop({ required: true })
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

    @Prop({ required: true })
    meta: Metadata;
}

export const ENftSchema = SchemaFactory.createForClass(ENft);