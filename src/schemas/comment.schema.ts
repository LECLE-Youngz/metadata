import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CommentDocument = HydratedDocument<Comment>;

@Schema()
export class Comment {
    @Prop({ required: true, unique: true, index: true, sparse: true })
    id: number;

    @Prop({ required: true })
    ownerId: string;

    @Prop({ required: true })
    postId: number;

    @Prop({ required: true })
    text: string;

    @Prop({ default: () => new Date().getTime() })
    timestamp: number;

    @Prop({ default: [] })
    likes: Array<number>;

    @Prop({ default: 0 })
    replyCommentId: number;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);