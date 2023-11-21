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
import { CreateCommentDto } from "src/dtos";

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
            const replyComment = await this.commentService.findReplyCommentByCommentId(comment.id);
            const mapReplyCmt = await Promise.all(replyComment.map(async (replyComment) => {
                const ownerReplyComment = await this.userService.findUserById(replyComment.ownerId);
                return {
                    id: replyComment.id,
                    text: replyComment.text,
                    timestamp: replyComment.timestamp,
                    ownerComment: {
                        id: ownerReplyComment.id,
                        name: ownerReplyComment.name,
                        email: ownerReplyComment.email,
                        picture: ownerReplyComment.picture,
                    },
                }
            }));
            return {
                id: comment.id,
                text: comment.text,
                timestamp: comment.timestamp,
                listReplyComment: mapReplyCmt,
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
            header: post.header,
            description: post.description,
            bookmark: post.bookmark,
            listLike: post.likes,
            listComment: listOwnerComment,
            timestamp: post.timestamp,
            tags: post.tags,
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
                // get reply cmt
                const replyComment = await this.commentService.findReplyCommentByCommentId(comment.id);
                const mapReplyCmt = await Promise.all(replyComment.map(async (replyComment) => {
                    const ownerReplyComment = await this.userService.findUserById(replyComment.ownerId);
                    return {
                        id: replyComment.id,
                        text: replyComment.text,
                        timestamp: replyComment.timestamp,
                        ownerComment: {
                            id: ownerReplyComment.id,
                            name: ownerReplyComment.name,
                            email: ownerReplyComment.email,
                            picture: ownerReplyComment.picture,
                        },
                    }
                }));
                return {
                    id: comment.id,
                    text: comment.text,
                    timestamp: comment.timestamp,
                    ownerComment: {
                        id: ownerComment.id,
                        name: ownerComment.name,
                        email: ownerComment.email,
                        picture: ownerComment.picture,
                    },
                    listReplyComment: mapReplyCmt,
                    numberOfReplies: comment.numberOfReplies
                }
            }));
            return {
                postId: post.id,
                text: post.text,
                header: post.header,
                description: post.description,
                bookmark: post.bookmark,
                listLike: post.likes,
                listComment: listOwnerComment,
                timestamp: post.timestamp,
                tags: post.tags,
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
        try {
            if (!accessToken) {
                throw new BadRequestException(`You don't have permission`);
            }
            const user = await verifyAccessToken(accessToken);

            // TODO: check nftId of user on blockchain

            return await this.postService.createPost(user.id, createPost);
        } catch (err) {
            throw new BadRequestException(err.message);
        }
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

    @Put("/post/:id/like-or-unlike")
    async updateLike(@Param("id") id: number, @Headers('Authorization') accessToken: string) {
        try {
            const user = await verifyAccessToken(accessToken);
            return await this.postService.updateLikeOrUnlikeAndList(id, user.id);
        }
        catch (err) {
            throw new BadRequestException(err.message);
        }
    }


    @Post("/post/:id/comment")
    async createComment(@Param("id") id: number, @Body() createComment: CreateCommentDto, @Headers('Authorization') accessToken: string) {
        try {
            const user = await verifyAccessToken(accessToken);
            // update number of comment
            const post = await this.postService.findPostById(id);
            const numberOfComments = post.numberOfComments + 1;
            await this.postService.updateNumberOfComments(id, numberOfComments);
            return await this.commentService.createComment(user.id, id, createComment.text);
        }
        catch (err) {
            throw new BadRequestException(err.message);
        }
    }

    @Post("/post/:id/comment/:commentId")
    async createReply(@Param("id") id: number, @Param("commentId") commentId: number, @Body() createComment: CreateCommentDto, @Headers('Authorization') accessToken: string) {
        const user = await verifyAccessToken(accessToken);
        const comment = await this.commentService.findCommentById(commentId);
        // check comment in post
        if (comment.postId !== Number(id)) {
            throw new BadRequestException(`This comment don't in this post`);
        }
        if (comment.replyCommentId !== 0) {
            throw new BadRequestException(`This comment is reply comment`);
        }
        // update number of reply comment
        const numberOfReplies = comment.numberOfReplies + 1;
        await this.commentService.updateNumberOfReplies(commentId, numberOfReplies);
        return await this.commentService.createReplyComment(user.id, id, createComment.text, commentId);
    }

    @Put("/post/comment/:commentId/like-or-unlike")
    async updateLikeComment(@Param("commentId") commentId: number, @Headers('Authorization') accessToken: string) {
        try {
            const user = await verifyAccessToken(accessToken);
            return await this.commentService.updateLikeOrUnlikeAndList(commentId, user.id);
        }
        catch (err) {
            throw new BadRequestException(err.message);
        }
    }

    @Get("/post/:id/comment/:commentId/reply")
    async getReplyComment(@Param("id") id: number, @Param("commentId") commentId: number) {
        try {
            const replyComment = await this.commentService.findReplyCommentByCommentId(commentId);
            const mapReplyCmt = await Promise.all(replyComment.map(async (replyComment) => {
                const ownerReplyComment = await this.userService.findUserById(replyComment.ownerId);
                return {
                    id: replyComment.id,
                    text: replyComment.text,
                    timestamp: replyComment.timestamp,
                    ownerComment: {
                        id: ownerReplyComment.id,
                        name: ownerReplyComment.name,
                        email: ownerReplyComment.email,
                        picture: ownerReplyComment.picture,
                    }
                }
            }));
            return mapReplyCmt;
        }
        catch (e) {
            throw new BadRequestException(e.message);
        }
    }

    @Get("/post/:id/comment")
    async getComment(@Param("id") id: number) {
        try {
            const comment = await this.commentService.findCommentByPostId(id);
            const mapUserAndReplyCmt = await Promise.all(comment.map(async (comment) => {
                const ownerComment = await this.userService.findUserById(comment.ownerId);
                const replyComment = await this.commentService.findReplyCommentByCommentId(comment.id);
                const mapReplyCmt = await Promise.all(replyComment.map(async (replyComment) => {
                    const ownerReplyComment = await this.userService.findUserById(replyComment.ownerId);
                    return {
                        id: replyComment.id,
                        text: replyComment.text,
                        timestamp: replyComment.timestamp,
                        ownerComment: {
                            id: ownerReplyComment.id,
                            name: ownerReplyComment.name,
                            email: ownerReplyComment.email,
                            picture: ownerReplyComment.picture,
                        },
                    }
                }));
                return {
                    id: comment.id,
                    text: comment.text,
                    timestamp: comment.timestamp,
                    ownerComment: {
                        id: ownerComment.id,
                        name: ownerComment.name,
                        email: ownerComment.email,
                        picture: ownerComment.picture,
                    },
                    listReplyComment: mapReplyCmt,
                    numberOfReplies: comment.numberOfReplies
                }
            }));
            return mapUserAndReplyCmt;
        }
        catch (e) {
            throw new BadRequestException(e.message);
        }
    }

    // user social

    @Get("/follower/:id")
    async getFollower(@Param("id") followerId: string) {
        const listUserId = await this.socialUserService.findListFollowerById(followerId);
        const listUser = await this.userService.findUserByListId(listUserId);
        return listUser;
    }


    @Get("/comment/:id")
    async getCommentById(@Param("id") id: number) {
        const comment = await this.commentService.findCommentById(id);
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
    }


    // Social User
    @Put("/social-user/:id/follow-or-unfollow")
    async updateFlowingAndFlower(@Param("id") id: string, @Headers('Authorization') accessToken: string) {
        try {
            const user = await verifyAccessToken(accessToken);
            if (id === user.id) {
                throw new BadRequestException(`You can't follow yourself`);

            }
            return await this.socialUserService.updateFlowingAndFlowerOrUnFlowingAndUnFlower(id, user.id);
        }
        catch (err) {
            throw new BadRequestException(err.message);
        }
    }


}