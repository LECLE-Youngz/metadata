import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UpdatePostDto } from "src/dtos";
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
        return this.postModel.create(
            {
                id: await this.getNewId(),
                ownerId,
                bookmark: [],
                likes: [],
                nftId: post.nftId,
                addressCollection: post.addressCollection,
                header: post.header,
                description: post.description,
                tags: post.tags,
                text: post.text,
                timestamp: new Date().getTime(),
                edited: false,
                exClusiveContent: post.exClusiveContent,
                numberOfComments: 0
            });
    }

    async updatePost(id: number, updatePostDto: UpdatePostDto): Promise<any> {
        return this.postModel.updateOne({ id }, {
            header: updatePostDto.header,
            description: updatePostDto.description,
            text: updatePostDto.text,
            tags: updatePostDto.tags,
            nftId: updatePostDto.nftId,
            edited: true,
            exClusiveContent: updatePostDto.exClusiveContent,
        })
    }

    async updateLikeOrUnlikeAndList(id: number, userId: string): Promise<any> {
        const post = await this.findPostById(id);
        if (post.likes.includes(userId)) {
            return this.postModel.updateOne({ id }, { $pull: { likes: userId } })
        }
        return this.postModel.updateOne({ id }, { $push: { likes: userId } })
    }

    async findAll(): Promise<Array<Post>> {
        return this.postModel.find();
    }


    async findListLikeById(id: string): Promise<Array<string>> {
        const post = await this.postModel.findOne({ id })
        return post.likes;
    }

    async getNewId(): Promise<number> {
        const posts = await this.findAll();
        if (posts.length == 0) {
            return 1;
        }
        const ids = posts.map((post) => post.id);
        return Math.max(...ids) + 1;
    }

    async updateBookmarkOrUnBookmarkAndList(id: number, userId: string): Promise<any> {
        const post = await this.findPostById(id);
        if (post.bookmark.includes(userId)) {
            return this.postModel.updateOne({ id }, { $pull: { bookmark: userId } })
        }
        return this.postModel.updateOne({ id }, { $push: { bookmark: userId } })
    }

    async findPostByOwnerId(ownerId: string): Promise<Array<Post>> {
        return this.postModel.find({ ownerId });
    }

    async deletePostById(id: number): Promise<any> {
        return this.postModel.deleteOne({ id });
    }
}