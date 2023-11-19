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

    async createPost(post: CreatePostDto): Promise<Post> {
        return this.postModel.create(post);
    }

    async updatePost(post: Post): Promise<any> {
        return this.postModel.updateOne({ id: post.id }, post);
    }

    async findAll(): Promise<Array<Post>> {
        return this.postModel.find();
    }

}