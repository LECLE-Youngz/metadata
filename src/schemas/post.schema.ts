import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { User } from "./user.schema";

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
    @Prop({ unique: true, index: true, sparse: true, auto: true })
    id: number;

    @Prop({ required: true })
    ownerId: number;

    @Prop({ required: true })
    text: string;

    @Prop({ default: () => new Date().getTime() })
    timestamp: number;

    @Prop()
    likes: Array<number>;

    @Prop()
    nftId: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);