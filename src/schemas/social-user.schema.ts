import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type SocialUserDocument = HydratedDocument<SocialUser>;

export class SocialUser {
    @Prop({ required: true, unique: true, index: true, sparse: true })
    id: number; //user Id

    @Prop({ default: [] })
    bookMarks: Array<number>; //post Id

    @Prop({ default: [] })
    following: Array<number>; //user Id

    @Prop({ default: [] })
    follower: Array<number>; //user Id
}

export const SocialUserSchema = SchemaFactory.createForClass(SocialUser);
