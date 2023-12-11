import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    Put,
    Headers,
    BadRequestException,
    Delete
} from "@nestjs/common";
import { CreatePostDto } from "src/dtos/create-post.dto";

import { PostService, CommentService, SocialUserService, UserService, NftService, MailerService, DataService } from "src/services";

import { verifyAccessToken } from "src/auth/google.verifier";
import { CreateCommentDto, UpdateNumNftDto, UpdateNumPromptDto, UpdatePostDto } from "src/dtos";
import { fetchWalletByAddress, getPromptPrice, getTokenPrice, ownerOf, queryListAllower, queryMysteryByDeployerAPI, queryPromptBuyerByTokenAndAddress, querySubscriberAPI, querySubscribingAPI, verifyTransferNftAPI, verifyTransferPromptAPI } from "src/api";
import { queryOwnerByIdNCollection } from "src/api/queryGraph";
import { mailConfig } from "src/configs/mail";
import { nftPurchasedRequired } from "src/api/mystery";

@Controller("api/v1/socials")
export class SocialController {
    constructor(
        private readonly postService: PostService,
        private readonly commentService: CommentService,
        private readonly userService: UserService,
        private readonly nftService: NftService,
        private readonly socialUserService: SocialUserService,
        private readonly mailerService: MailerService,
        private readonly dataService: DataService,
    ) { }

    //post social
    @Get("/post/tags")
    async getAllTag() {
        try {
            const posts = await this.postService.findAll();
            const listTag = posts.map(post => post.tags);
            // filter duplicate tags
            const listTagFilter = listTag.reduce((acc, cur) => [...acc, ...cur], []);
            const listTagFilterDuplicate = [...new Set(listTagFilter)];
            // count tag
            const countTag = listTagFilterDuplicate.map(tag => {
                const count = listTagFilter.filter(tagFilter => tagFilter === tag).length;
                return {
                    tag,
                    count
                }
            });
            return countTag;
        } catch (err) {
            throw new BadRequestException(err.message);
        }
    }
    @Post("/post")
    async createPost(@Body() createPost: CreatePostDto, @Headers('Authorization') accessToken: string) {
        try {
            if (!accessToken) {
                throw new BadRequestException(`You don't have permission`);
            }
            const user = await verifyAccessToken(accessToken);
            const wallet = await fetchWalletByAddress(user.email);
            if (!wallet.data.address) {
                throw new BadRequestException(`You don't have wallet in node api`);
            }
            const address = wallet.data.address.toLowerCase();


            const ownerNft = await ownerOf(createPost.nftId, createPost.addressCollection);

            if (ownerNft.toLowerCase() !== address) {
                throw new BadRequestException(`You don't have this nft`);
            }
            return await this.postService.createPost(user.id, createPost);
        } catch (err) {
            throw new BadRequestException(err.message);
        }
    }
    @Post("/post/:id/comment")
    async createComment(@Param("id") id: number, @Body() createComment: CreateCommentDto, @Headers('Authorization') accessToken: string) {
        try {
            const user = await verifyAccessToken(accessToken);
            return await this.commentService.createComment(user.id, id, createComment.text);
        }
        catch (err) {
            throw new BadRequestException(err.message);
        }
    }


    @Get("/post/owner")
    async getPostByOwnerId(@Headers('Authorization') accessToken: string) {
        try {
            const user = await verifyAccessToken(accessToken);
            const posts = await this.postService.findPostByOwnerId(user.id);
            const mapPost = await Promise.all(posts.map(async (post) => {
                const comment = await this.commentService.findCommentByPostId(post.id);
                const nft = await this.nftService.findNftByIdAndAddressCollection(post.nftId, post.addressCollection);
                const listOwnerComment = await Promise.all(comment.map(async (comment) => {
                    const ownerComment = await this.userService.findUserById(comment.ownerId);
                    const replyComment = await this.commentService.findReplyCommentByCommentId(comment.id);
                    const mapReplyCmt = await Promise.all(replyComment.map(async (replyComment) => {
                        const ownerReplyComment = await this.userService.findUserById(replyComment.ownerId);
                        return {
                            id: replyComment.id,
                            text: replyComment.text,
                            timestamp: replyComment.timestamp,
                            likes: replyComment.likes,
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
                    exclusiveContent: post.exclusiveContent,
                    bookmark: post.bookmark,
                    likes: post.likes,
                    listComment: listOwnerComment,
                    timestamp: post.timestamp,
                    tags: post.tags,
                    nft: nft,
                }
            }));
            return mapPost;
        }
        catch (err) {
            throw new BadRequestException(err.message);
        }
    }

    @Get("/post/user/:id")
    async getPostByUserId(@Param("id") id: string) {
        try {
            return (await this.postService.findPostByOwnerId(id)).map(post => post.id);

        }
        catch (err) {
            throw new BadRequestException(err.message);
        }
    }

    @Get("/post")
    async getAllPosts() {
        const posts = await this.postService.findAll();
        return posts.map(post => post.id);
    }
    // Search Post by all
    @Get("/post/search/:text")
    async searchPost(@Param("text") text: string) {
        const posts = await this.postService.findAll();
        const lowerText = text.toLowerCase();
        const listPost = posts.filter(post => {
            if (post.text.toLowerCase().includes(lowerText) || post.header.toLowerCase().includes(lowerText) || post.description.toLowerCase().includes(lowerText)) {
                return true;
            }
            const listTag = post.tags;
            const listTagLower = listTag.map(tag => tag.toLowerCase());
            if (listTagLower.includes(lowerText)) {
                return true;
            }
            return false;
        });
        return listPost.map(post => post.id);
    }



    @Put("/post/:id")
    async updatePost(@Param("id") id: number, @Body() updatePostDto: UpdatePostDto, @Headers('Authorization') accessToken: string) {
        const user = await verifyAccessToken(accessToken);
        const post = await this.postService.findPostById(id);
        if (post.ownerId !== user.id) {
            throw new BadRequestException(`You don't have permission`);
        }
        return await this.postService.updatePost(id, updatePostDto);
    }
    @Delete("/post/:id")
    async deletePost(@Param("id") id: number, @Headers('Authorization') accessToken: string) {
        const user = await verifyAccessToken(accessToken);
        const post = await this.postService.findPostById(id);
        if (post.ownerId !== user.id) {
            throw new BadRequestException(`You don't have permission`);
        }
        return await this.postService.deletePostById(id);
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

    @Get("/post/:id")
    async getPostById(@Param("id") id: number, @Headers('Authorization') accessToken: string) {
        const post = await this.postService.findPostById(id);
        const ownerPost = await this.userService.findUserById(post.ownerId);
        const comment = await this.commentService.findCommentByPostId(post.id);
        const nft = await this.nftService.findNftByIdAndAddressCollection(post.nftId, post.addressCollection);
        const user = await verifyAccessToken(accessToken);
        if (!user.email) {
            throw new BadRequestException(`You don't have permission, don't have email`);
        }
        const wallet = await fetchWalletByAddress(user.email);
        if (!wallet.data.address) {
            throw new BadRequestException(`You don't have wallet in node api`);
        }
        const [price, promptPrice, listAllower, listBoughts] = await Promise.all([
            getTokenPrice(nft.addressCollection, String(nft.id)),
            getPromptPrice(nft.addressCollection, String(nft.id)),
            queryListAllower(nft.addressCollection, nft.id),
            queryPromptBuyerByTokenAndAddress(nft.addressCollection, nft.id),
        ]);
        const data = await this.dataService.findDataByIdAndAddressCollection(nft.id, nft.addressCollection);

        return {
            postId: post.id,
            text: post.text,
            header: post.header,
            exclusiveContent: post.exclusiveContent,
            description: post.description,
            bookmark: post.bookmark,
            likes: post.likes,
            timestamp: post.timestamp,
            tags: post.tags,
            nft: {
                price: {
                    avax: price[0].toString(),
                    usd: price[1].toString(),
                },
                promptPrice: {
                    avax: promptPrice[0].toString(),
                    usd: promptPrice[1].toString(),
                },
                nftId: nft.id,
                name: nft.name,
                description: nft.description,
                image: nft.image,
                attributes: nft.attributes,
                addressCollection: nft.addressCollection,
                type: nft.type,
                data: data.meta,

            },

            listAllower: listAllower,
            listBoughts: listBoughts,
            postOwner: {
                id: ownerPost.id,
                name: ownerPost.name,
                email: ownerPost.email,
                picture: ownerPost.picture,
            }
        }
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
    @Post("/post/:id/comment/:commentId")
    async createReply(@Param("id") id: number, @Param("commentId") commentId: number, @Body() createComment: CreateCommentDto, @Headers('Authorization') accessToken: string) {
        const user = await verifyAccessToken(accessToken);
        const comment = await this.commentService.findCommentById(commentId);
        // check comment in post
        if (comment.postId !== Number(id)) {
            throw new BadRequestException(`This comment don't in this post`);
        }
        if (comment.replyCommentId !== 0) {
            // add reply comment to original comment
            const replyComment = await this.commentService.findReplyCommentById(comment.replyCommentId);
            // update number of reply comment
            const numberOfReplies = replyComment.numberOfReplies + 1;
            await this.commentService.updateNumberOfReplies(comment.replyCommentId, numberOfReplies);
            return await this.commentService.createReplyComment(user.id, id, createComment.text, comment.replyCommentId);
        }
        // update number of reply comment
        const numberOfReplies = comment.numberOfReplies + 1;
        await this.commentService.updateNumberOfReplies(commentId, numberOfReplies);
        return await this.commentService.createReplyComment(user.id, id, createComment.text, commentId);
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
            return await this.socialUserService.updateFlowingAndFlowerOrUnFlowingAndUnFlower(user.id, id);
        }
        catch (err) {
            throw new BadRequestException(err.message);
        }
    }


    // get all tag



    //
    @Put("/post/:id/bookmark-or-unbookmark")
    async updateBookmark(@Param("id") id: number, @Headers('Authorization') accessToken: string) {
        try {
            if (!accessToken) {
                throw new BadRequestException(`You don't have permission`);
            }
            const user = await verifyAccessToken(accessToken);
            await this.postService.updateBookmarkOrUnBookmarkAndList(id, user.id);
            return await this.socialUserService.updateBookmarksOrUnBookmarks(user.id, id);

        }
        catch (err) {
            throw new BadRequestException(err.message);
        }
    }

    @Get("/post/tags/:tag")
    async getPostByTag(@Param("tag") tag: string) {
        const posts = await this.postService.findAll();
        const listPost = posts.filter(post => post.tags.includes(tag));
        return listPost.map(post => post.id);
    }

    @Get("/post/:id")
    async getSocialById(@Param("id") id: number, @Headers('Authorization') accessToken: string) {
        const post = await this.postService.findPostById(id);
        const ownerPost = await this.userService.findUserById(post.ownerId);
        const comment = await this.commentService.findCommentByPostId(post.id);
        const nft = await this.nftService.findNftByIdAndAddressCollection(post.nftId, post.addressCollection);
        const user = await verifyAccessToken(accessToken);
        if (!user.email) {
            throw new BadRequestException(`You don't have permission, don't have email`);
        }
        const wallet = await fetchWalletByAddress(user.email);
        if (!wallet.data.address) {
            throw new BadRequestException(`You don't have wallet in node api`);
        }

        if (post.exclusiveContent === true && post.ownerId !== user.id) {
            const walletOwnerPost = await fetchWalletByAddress(ownerPost.email);
            if (!walletOwnerPost.data.address) {
                throw new BadRequestException(`Owner don't have wallet in node api`);
            }
            const listSubscribers = await querySubscriberAPI(walletOwnerPost.data.address) ?? [];
            if (!listSubscribers.includes(wallet.data.address.toLowerCase())) {
                const listOwnerComment = await Promise.all(comment.map(async (comment) => {
                    const ownerComment = await this.userService.findUserById(comment.ownerId);
                    const replyComment = await this.commentService.findReplyCommentByCommentId(comment.id);
                    const mapReplyCmt = await Promise.all(replyComment.map(async (replyComment) => {
                        const ownerReplyComment = await this.userService.findUserById(replyComment.ownerId);
                        return {
                            id: replyComment.id,
                            text: replyComment.text,
                            timestamp: replyComment.timestamp,
                            likes: replyComment.likes,
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
                        likes: comment.likes,
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
                    text: null,
                    header: post.header,
                    exclusiveContent: post.exclusiveContent,
                    description: post.description,
                    bookmark: post.bookmark,
                    likes: post.likes,
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

        }
        const listOwnerComment = await Promise.all(comment.map(async (comment) => {
            const ownerComment = await this.userService.findUserById(comment.ownerId);
            const replyComment = await this.commentService.findReplyCommentByCommentId(comment.id);
            const mapReplyCmt = await Promise.all(replyComment.map(async (replyComment) => {
                const ownerReplyComment = await this.userService.findUserById(replyComment.ownerId);
                return {
                    id: replyComment.id,
                    text: replyComment.text,
                    timestamp: replyComment.timestamp,
                    likes: replyComment.likes,
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
                likes: comment.likes,
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
            exclusiveContent: post.exclusiveContent,
            description: post.description,
            bookmark: post.bookmark,
            likes: post.likes,
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
    // get all post in bookmark user 
    @Get("/post/bookmark/:id")
    async getPostByBookmark(@Param("id") id: string) {
        const listPostId = await this.socialUserService.findListBookmarkById(id);
        const listPost = await this.postService.findPostByListId(listPostId);
        return listPost.map(post => post.id);
    }

    @Put("/increase-nft/:creatorId")
    async increaseSoldAndPurchased(@Param("creatorId") creatorId: string, @Headers('Authorization') accessToken: string, @Body() body: UpdateNumNftDto) {

        const userBuyer = await verifyAccessToken(accessToken);

        await this.socialUserService.increaseNumSoldAndNumPurchase(userBuyer.id, creatorId);
        const walletBuyer = await fetchWalletByAddress(userBuyer.email);
        if (!walletBuyer.data.address) {
            throw new BadRequestException(`You don't have wallet in node api`);
        }
        const userCreator = await this.userService.findUserById(creatorId);
        const walletCreator = await fetchWalletByAddress(userCreator.email);
        if (!walletCreator.data.address) {
            throw new BadRequestException(`Creator don't have wallet in node api`);
        }
        // const verify = await verifyTransferNftAPI(walletCreator.data.address, walletBuyer.data.address, body.addressCollection, body.nftId.toString());
        // if (!verify) {
        //     throw new BadRequestException(`You don't have this nft`);
        // }
        const listMystery = await queryMysteryByDeployerAPI(walletCreator.data.address);
        const listNftPurchasedRequired = await Promise.all(listMystery.map(async (mystery) => {
            const count = await nftPurchasedRequired(mystery).toString();
            return count;
        }))
        const res = await this.socialUserService.increaseListPurchasedByCreator(userBuyer.id, creatorId);
        // find res.number in listNftPurchasedRequired
        const index = listNftPurchasedRequired.findIndex(item => item === res.number.toString());
        if (index) {
            await this.mailerService.sendMail({
                to: userBuyer.email,
                subject: "",
                html: mailConfig(userBuyer.given_name, userCreator.given_name, index),
            })
        }
        return {
            status: "success"
        }
    }

    @Put("/increase-prompt/:creatorId")
    async increasePromptSoldAndPurchased(@Param("creatorId") creatorId: string, @Headers('Authorization') accessToken: string, @Body() body: UpdateNumPromptDto) {
        const userBuyer = await verifyAccessToken(accessToken);
        const walletBuyer = await fetchWalletByAddress(userBuyer.email);
        if (!walletBuyer.data.address) {
            throw new BadRequestException(`You don't have wallet in node api`);
        }
        const userCreator = await this.userService.findUserById(creatorId);
        const walletCreator = await fetchWalletByAddress(userCreator.email);
        if (!walletCreator.data.address) {
            throw new BadRequestException(`Creator don't have wallet in node api`);
        }
        // const verify = await verifyTransferPromptAPI(walletCreator.data.address, walletBuyer.data.address, body.addressCollection, body.nftId.toString());
        // if (!verify) {
        //     throw new BadRequestException(`You don't have this nft`);
        // }
        await this.socialUserService.increaseNumPromptSoldAndNumPromptPurchase(userBuyer.id, creatorId);
        return {
            status: "success"
        }
    }

    @Get("/creator/:addressCreator/buyer/:addressBuyer")
    async getNftsByCreatorAddress(@Param("addressCreator") addressCreator: string, @Param("addressBuyer") addressBuyer): Promise<any> {
        const walletBuyer = await fetchWalletByAddress(addressBuyer);
        if (!walletBuyer.data.address) {
            throw new BadRequestException(`You don't have wallet in node api`);
        }
        const userBuyer = await this.userService.findUserByEmail(walletBuyer.data.owner);
        const socialUserBuyer = await this.socialUserService.findSocialById(userBuyer.id);
        const listPurchasedByCreator = socialUserBuyer.listPurchasedByCreator;
        const index = listPurchasedByCreator.findIndex(item => item.address === addressCreator);
        if (index === -1) {
            return {
                addressBuyer: addressBuyer,
                addressCreator: addressCreator,
                numBuy: 0
            }
        }
        return {
            addressBuyer: addressBuyer,
            addressCreator: addressCreator,
            numBuy: listPurchasedByCreator[index].count
        }
    }
}