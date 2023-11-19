import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CommentDocument = HydratedDocument<Comment>;

@Schema()
export class Comment {
    @Prop({ unique: true, index: true, sparse: true, auto: true })
    id: number;

    @Prop({ required: true })
    ownerId: number;

    @Prop({ required: true })
    postId: number;

    @Prop({ required: true })
    text: string;

    @Prop({ default: () => new Date().getTime() })
    timestamp: number;

    @Prop({ default: [] })
    likes: Array<number>;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);