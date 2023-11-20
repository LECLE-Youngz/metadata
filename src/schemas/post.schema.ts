import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { User } from "./user.schema";

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
    // id auto increment
    @Prop({ unique: true, index: true, sparse: true, auto: true, type: Number })
    id: number; // id auto increment

    @Prop({ required: true })
    ownerId: string;

    @Prop({ required: true })
    text: string;

    @Prop({ default: () => new Date().getTime() })
    timestamp: number;

    @Prop({ default: [] })
    likes: Array<number>;

    @Prop({ default: false })
    edited: boolean;

    @Prop({ required: true })
    nftId: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);