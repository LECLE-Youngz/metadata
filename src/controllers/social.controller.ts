import {
    Controller,
    Get,
    Param,
    Post,
    Body
} from "@nestjs/common";
import { CreatePostDto } from "src/dtos/create-post.dto";

import { PostService, CommentService, SocialUserService, UserService, NftService } from "src/services";

@Controller("api/v1/socials")
export class SocialController {
    constructor(
        private readonly postService: PostService,
        private readonly commentService: CommentService,
        private readonly userService: UserService,
        private readonly nftService: NftService,
    ) { }

    @Get("/post/:id")
    async getSocialById(@Param("id") id: number) {
        const post = await this.postService.findPostById(id);
        const comment = await this.commentService.findCommentByPostId(post.id);
        const nft = await this.nftService.findNftById(post.nftId);
        const ownerPost = await this.userService.findUserById(post.ownerId);
        const listOwnerComment = await Promise.all(comment.map(async (comment) => {
            const ownerComment = await this.userService.findUserById(comment.ownerId);
            return { ...comment, ownerComment };
        }));
        return { ...post, ...nft, ownerPost, listOwnerComment };
    }

    @Get("/post")
    async getAllSocials() {
        const posts = await this.postService.findAll();
        const listSocials = await Promise.all(posts.map(async (post) => {
            const comment = await this.commentService.findCommentByPostId(post.id);
            const nft = await this.nftService.findNftById(post.nftId);
            const ownerPost = await this.userService.findUserById(post.ownerId);
            const listOwnerComment = await Promise.all(comment.map(async (comment) => {
                const ownerComment = await this.userService.findUserById(comment.ownerId);
                return { ...comment, ownerComment };
            }));
            return { ...post, ...nft, ownerPost, listOwnerComment };
        }));
        return listSocials;
    }

    @Post("/post")
    async createSocial(@Body() createPost: CreatePostDto) {
        return await this.postService.createPost(createPost);
    }
}