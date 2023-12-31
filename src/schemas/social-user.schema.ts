import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type SocialUserDocument = Document & SocialUser;

export class AddressCount {
    address: string;
    count: number;
}

@Schema()
export class SocialUser {
    @Prop({ required: true, unique: true, index: true, sparse: true })
    id: string; // user Id

    @Prop({ required: true })
    bookmarks: Array<number>; // post Id

    @Prop({ required: true })
    following: Array<string>; // user Id

    @Prop({ required: true })
    follower: Array<string>; // user Id

    @Prop({ required: true })
    numSold: number;

    @Prop({ required: true })
    numPurchased: number;

    @Prop({ required: true })
    numPromptSold: number;

    @Prop({ required: true })
    numPromptPurchased: number;

    @Prop({ required: true })
    listPurchasedByCreator: Array<AddressCount>;
}

export const SocialUserSchema = SchemaFactory.createForClass(SocialUser);
