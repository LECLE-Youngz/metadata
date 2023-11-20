import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreatePostDto } from "src/dtos/create-post.dto";
import { Post, PostDocument } from "src/schemas";

@Injectable()
export class PostService {
    constructor(
        @InjectModel(Post.name)
        private postModel: Model<PostDocument>,
    ) { }

    async findPostById(id: number): Promise<Post> {
        return this.postModel.findOne({ id });
    }

    async findPostByListId(ids: number[]): Promise<Array<Post>> {
        return this.postModel.find({ id: { $in: ids } });
    }

    async createPost(ownerId: string, post: CreatePostDto): Promise<Post> {
        return this.postModel.create({ ...post, ownerId });
    }

    async updatePost(id: number, text: string): Promise<any> {
        return this.postModel.updateOne({ id }, { text, timestamp: new Date().getTime(), edited: true })
    }

    async findAll(): Promise<Array<Post>> {
        return this.postModel.find();
    }

    async addListLike(id: string, postId: number): Promise<any> {
        return this.postModel.updateOne({ id }, { $push: { like: postId } })
    }

    async removeListLike(id: string, postId: number): Promise<any> {
        return this.postModel.updateOne({ id }, { $pull: { like: postId } })
    }

    async findListLikeById(id: string): Promise<Array<number>> {
        const post = await this.postModel.findOne({ id })
        return post.likes;
    }
}