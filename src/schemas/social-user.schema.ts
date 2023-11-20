import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type SocialUserDocument = HydratedDocument<SocialUser>;

export class SocialUser {
    @Prop({ required: true, unique: true, index: true, sparse: true })
    id: string; //user Id

    @Prop({ default: [] })
    bookMarks: Array<string>; //post Id

    @Prop({ default: [] })
    following: Array<string>; //user Id

    @Prop({ default: [] })
    follower: Array<string>; //user Id
}

export const SocialUserSchema = SchemaFactory.createForClass(SocialUser);
