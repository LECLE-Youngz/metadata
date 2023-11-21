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
        // without reply comments
        return this.commentModel.find({ postId, replyCommentId: 0 });

    }

    async createComment(ownerId: string, postId: number, text: string): Promise<Comment> {
        return this.commentModel.create(
            {
                ownerId: ownerId,
                postId: postId,
                text: text,
                timestamp: new Date().getTime(),
                likes: [],
                replyCommentId: 0,
                id: await this.getNewId()
            });
    }

    async createReplyComment(ownerId: string, postId: number, text: string, replyCommentId: number): Promise<Comment> {

        return this.commentModel.create(
            {
                ownerId: ownerId,
                postId: postId,
                text: text,
                timestamp: new Date().getTime(),
                likes: [],
                replyCommentId: replyCommentId,
                id: await this.getNewId(),
                numberOfReplies: 0
            });
    }

    async updateComment(comment: Comment): Promise<any> {
        return this.commentModel.updateOne({ id: comment.id }, comment);
    }

    async updateNumberOfReplies(id: number, numberOfReplies: number): Promise<any> {
        return this.commentModel.updateOne({ id }, { numberOfReplies })
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

    async findReplyCommentByCommentId(commentId: number): Promise<Array<Comment>> {
        return this.commentModel.find({ replyCommentId: commentId });
    }

    async updateLikeOrUnlikeAndList(id: number, userId: string): Promise<any> {
        const comment = await this.findCommentById(id);
        if (comment.likes.includes(userId)) {
            return this.commentModel.updateOne({ id }, { $pull: { likes: userId } })
        }
        return this.commentModel.updateOne({ id }, { $push: { likes: userId } })
    }
}