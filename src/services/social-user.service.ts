import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AddressCount, SocialUser, SocialUserDocument } from "src/schemas";
import { PostService } from "./post.service";

@Injectable()
export class SocialUserService {
    constructor(
        @InjectModel(SocialUser.name)
        private socialUserModel: Model<SocialUserDocument>,
    ) { }

    async findSocialUserById(id: string): Promise<SocialUser> {
        return this.socialUserModel.findOne({ id });
    }


    async createSocialUser(
        id: string
    ): Promise<SocialUser> {
        return this.socialUserModel.create(
            {
                id, bookMarks: [], following: [], follower: [],
                numSold: 0, numPurchased: 0, numPromptSold: 0, numPromptPurchased: 0, listPurchasedByCreator: []
            });

    }




    async findAll(): Promise<Array<SocialUser>> {
        return this.socialUserModel.find();
    }

    async findSocialUserByListId(ids: string[]): Promise<Array<SocialUser>> {
        return this.socialUserModel.find({ id: { $in: ids } });
    }

    async findListFlowingById(id: string): Promise<Array<string>> {
        const socialUser = await this.socialUserModel.findOne({ id })
        return socialUser.following;
    }

    async findListFollowerById(id: string): Promise<Array<string>> {
        const socialUser = await this.socialUserModel.findOne({ id })
        return socialUser.follower;
    }

    async updateFlowingAndFlowerOrUnFlowingAndUnFlower(id: string, flowingId: string): Promise<any> {
        const socialUser = await this.socialUserModel.findOne({ id })
        const flowingUser = await this.socialUserModel.findOne({ id: flowingId })
        if (socialUser.following.includes(flowingId) && flowingUser.follower.includes(id)) {
            await this.socialUserModel.updateOne({ id }, { $pull: { following: flowingId } })
            await this.socialUserModel.updateOne({ id: flowingId }, { $pull: { follower: id } })
            return {
                status: "unflowing"
            };
        }
        await this.socialUserModel.updateOne({ id }, { $push: { following: flowingId } })
        await this.socialUserModel.updateOne({ id: flowingId }, { $push: { follower: id } })
        return {
            status: "flowing"
        };
    }

    async updateBookmarksOrUnBookmarks(id: string, postId: number): Promise<any> {
        const socialUser = await this.socialUserModel.findOne({ id })
        if (socialUser.bookmarks.includes(postId)) {
            await this.socialUserModel.updateOne({ id }, { $pull: { bookmarks: postId } })
            return {
                status: "unbookmark"
            };
        }
        await this.socialUserModel.updateOne({ id }, { $push: { bookmarks: postId } })
        return {
            status: "bookmark"
        };
    }

    async findListBookmarkById(id: string): Promise<Array<number>> {
        const socialUser = await this.socialUserModel.findOne({ id })
        return socialUser.bookmarks;
    }

    async findSocialById(id: string): Promise<SocialUser> {
        return this.socialUserModel.findOne({ id })
    }

    async getNumSoldBuyerWithCreator(buyerId: string, creatorId: string): Promise<number> {
        const listPurchasedByCreator: Promise<Array<AddressCount>> = this.socialUserModel.findOne({ id: creatorId });
        const index = (await listPurchasedByCreator).findIndex(item => item.address === buyerId);
        if (index === -1) {
            return 0;
        }
        return (await listPurchasedByCreator)[index].count;
    }

    async increaseListPurchasedByCreator(addressBuyer: string, addressCreator: string): Promise<any> {
        const socialUserBuyer = await this.socialUserModel.findOne({ id: addressBuyer })
        const socialUserCreator = await this.socialUserModel.findOne({ id: addressCreator })
        if (!socialUserBuyer || !socialUserCreator) {
            return {
                status: "error"
            }
        }
        const listPurchasedByCreator: Array<AddressCount> = socialUserCreator.listPurchasedByCreator;
        const index = listPurchasedByCreator.findIndex(item => item.address === addressBuyer);
        if (index === -1) {
            listPurchasedByCreator.push({ address: addressBuyer, count: 1 });
        } else {
            listPurchasedByCreator[index].count++;
        }
        await this.socialUserModel.updateOne({ id: addressCreator }, { listPurchasedByCreator })
        return {
            addressBuyer: addressBuyer,
            addressCreator: addressCreator,
            number: listPurchasedByCreator[index].count
        }
    }

    async increaseNumSoldAndNumPurchase(idUserBuyer: string, idUserSold: string): Promise<string> {
        try {
            await this.socialUserModel.updateOne({ id: idUserBuyer }, { $inc: { numPurchased: 1 } })
            await this.socialUserModel.updateOne({ id: idUserSold }, { $inc: { numSold: 1 } })
            return "success";
        } catch (error) {
            return "error";
        }
    }

    async increaseNumPromptSoldAndNumPromptPurchase(idUserBuyer: string, idUserSold: string): Promise<string> {
        try {
            await this.socialUserModel.updateOne({ id: idUserBuyer }, { $inc: { numPromptPurchased: 1 } })
            await this.socialUserModel.updateOne({ id: idUserSold }, { $inc: { numPromptSold: 1 } })
            return "success";
        }
        catch (error) {
            return "error";
        }
    }
}