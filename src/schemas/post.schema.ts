import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { User } from "./user.schema";

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
    @Prop({ required: true, unique: true, index: true, sparse: true })
    id: number;

    @Prop({ required: true })
    ownerId: string;

    @Prop({ required: true })
    header: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    text: string;

    @Prop({ default: () => new Date().getTime() })
    timestamp: number;

    @Prop({ default: [] })
    likes: Array<string>;

    @Prop({ default: false })
    edited: boolean;

    @Prop({ required: true })
    nftId: number;

    @Prop({ required: true })
    addressCollection: string;

    @Prop({ default: [] })
    bookmark: Array<string>;

    @Prop({ default: [] })
    tags: Array<string>;
}
export const PostSchema = SchemaFactory.createForClass(Post);