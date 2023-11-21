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

    async createComment(ownerId: string, postId: number, text: string): Promise<Comment> {
        return this.commentModel.create({ ownerId, postId, text, timestamp: new Date().getTime(), likes: [], replyCommentId: 0, id: await this.getNewId() });
    }

    async createReplyComment(ownerId: string, postId: number, text: string, replyCommentId: number): Promise<Comment> {
        return this.commentModel.create({ ownerId, postId, text, timestamp: new Date().getTime(), likes: [], replyCommentId, id: await this.getNewId() });
    }

    async updateComment(comment: Comment): Promise<any> {
        return this.commentModel.updateOne({ id: comment.id }, comment);
    }

    async findAll(): Promise<Array<Comment>> {
        return this.commentModel.find();
    }

    async getNewId(): Promise<number> {
        const comments = await this.findAll();
        if (comments.length === 0) return 1;
        const ids = comments.map((comment) => comment.id);
        return Math.max(...ids) + 1;
    }
}