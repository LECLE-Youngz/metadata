import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    Put,
    Headers,
    BadRequestException
} from "@nestjs/common";
import { CreatePostDto } from "src/dtos/create-post.dto";

import { PostService, CommentService, SocialUserService, UserService, NftService } from "src/services";

import { verifyAccessToken } from "src/auth/google.verifier";

@Controller("api/v1/socials")
export class SocialController {
    constructor(
        private readonly postService: PostService,
        private readonly commentService: CommentService,
        private readonly userService: UserService,
        private readonly nftService: NftService,
        private readonly socialUserService: SocialUserService
    ) { }

    //post social

    @Get("/post/:id")
    async getSocialById(@Param("id") id: number) {
        const post = await this.postService.findPostById(id);
        const comment = await this.commentService.findCommentByPostId(post.id);
        const nft = await this.nftService.findNftById(post.nftId);
        const ownerPost = await this.userService.findUserById(post.ownerId);
        const listOwnerComment = await Promise.all(comment.map(async (comment) => {
            const ownerComment = await this.userService.findUserById(comment.ownerId);
            return {
                id: comment.id,
                text: comment.text,
                timestamp: comment.timestamp,
                ownerComment: {
                    id: ownerComment.id,
                    name: ownerComment.name,
                    email: ownerComment.email,
                    picture: ownerComment.picture,
                }
            }
        }));
        return {
            postId: post.id,
            text: post.text,
            listLike: post.likes,
            listComment: listOwnerComment,
            nft: nft,
            postOwner: {
                id: ownerPost.id,
                name: ownerPost.name,
                email: ownerPost.email,
                picture: ownerPost.picture,
            }
        }
    }

    @Get("/post")
    async getAllPosts() {
        const posts = await this.postService.findAll();
        const listSocials = await Promise.all(posts.map(async (post) => {
            const comment = await this.commentService.findCommentByPostId(post.id);
            const nft = await this.nftService.findNftById(post.nftId);
            const ownerPost = await this.userService.findUserById(post.ownerId);
            const listOwnerComment = await Promise.all(comment.map(async (comment) => {
                const ownerComment = await this.userService.findUserById(comment.ownerId);
                return {
                    id: comment.id,
                    text: comment.text,
                    timestamp: comment.timestamp,
                    ownerComment: {
                        id: ownerComment.id,
                        name: ownerComment.name,
                        email: ownerComment.email,
                        picture: ownerComment.picture,
                    }
                }
            }));
            return {
                postId: post.id,
                text: post.text,
                listLike: post.likes,
                listComment: listOwnerComment,
                nft: nft,
                postOwner: {
                    id: ownerPost.id,
                    name: ownerPost.name,
                    email: ownerPost.email,
                    picture: ownerPost.picture,
                }
            }
        }));
        return listSocials;
    }

    @Post("/post")
    async createPost(@Body() createPost: CreatePostDto, @Headers('Authorization') accessToken: string) {
        const user = await verifyAccessToken(accessToken);
        return await this.postService.createPost(user.id, createPost);
    }

    @Put("/post/:id")
    async updateSocial(@Param("id") id: number, @Body() text: string, @Headers('Authorization') accessToken: string) {
        const user = await verifyAccessToken(accessToken);
        const post = await this.postService.findPostById(id);
        if (post.ownerId !== user.id) {
            throw new BadRequestException(`You don't have permission`);
        }
        return await this.postService.updatePost(id, text);
    }

    @Put("/post/:id/like")
    async updateLike(@Param("id") id: number, @Headers('Authorization') accessToken: string) {
        const user = await verifyAccessToken(accessToken);
        return await this.postService.addListLike(user.id, id);
    }

    @Put("/post/:id/unlike")
    async updateUnLike(@Param("id") id: number, @Headers('Authorization') accessToken: string) {
        const user = await verifyAccessToken(accessToken);
        return await this.postService.removeListLike(user.id, id);
    }

    @Post("/post/:id/comment")
    async createComment(@Param("id") id: number, @Body() text: string, @Headers('Authorization') accessToken: string) {
        const user = await verifyAccessToken(accessToken);
        return await this.commentService.createComment(user.id, id, text);
    }

    // user social

    @Put("/flowing/:id")
    async updateFlower(@Param("id") flowingId: string, @Headers('Authorization') accessToken: string) {
        const user = await verifyAccessToken(accessToken);
        return await this.socialUserService.addListFlow(user.id, flowingId);
    }

    @Put("/unflowing/:id")
    async updateUnFlower(@Param("id") flowingId: string, @Headers('Authorization') accessToken: string) {
        const user = await verifyAccessToken(accessToken);
        return await this.socialUserService.removeListFlow(user.id, flowingId);
    }

    @Put("/bookmarks/:id")
    async updateBookMarks(@Param("id") postId: number, @Headers('Authorization') accessToken: string) {
        const user = await verifyAccessToken(accessToken);
        return await this.socialUserService.addListBookMark(user.id, postId);
    }

    @Get("/flowing/:id")
    async getFlowing(@Param("id") flowingId: string) {
        const listUserId = await this.socialUserService.findListFlowingById(flowingId);
        const listUser = await this.userService.findUserByListId(listUserId);
        return listUser;
    }

    @Get("/follower/:id")
    async getFollower(@Param("id") followerId: string) {
        const listUserId = await this.socialUserService.findListFollowerById(followerId);
        const listUser = await this.userService.findUserByListId(listUserId);
        return listUser;
    }

    // @Get("/bookmarks/:id")
    // async getBookMarks(@Param("id") bookMarksId: number) {
    //     const listPostId = await this.socialUserService.findListBookMarksById(bookMarksId);
    //     const listPost = await this.postService.findPostByListId(listPostId);
    //     return listPost;
    // }

}