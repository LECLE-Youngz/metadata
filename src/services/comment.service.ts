import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Comment, CommentDocument } from "src/schemas";

@Injectable()
export class CommentService {
    constructor(
        @InjectModel(Comment.name)
        private commentModel: Model<CommentDocument>,
    ) { }

    async findCommentById(id: number): Promise<Comment> {
        return this.commentModel.findOne({ id });
    }

    async findCommentByPostId(postId: number): Promise<Array<Comment>> {
        return this.commentModel.find({ postId });
    }

    async createComment(comment: Comment): Promise<Comment> {
        return this.commentModel.create(comment);
    }

    async updateComment(comment: Comment): Promise<any> {
        return this.commentModel.updateOne({ id: comment.id }, comment);
    }

    async findAll(): Promise<Array<Comment>> {
        return this.commentModel.find();
    }

}