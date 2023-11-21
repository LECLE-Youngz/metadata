import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SocialUser, SocialUserDocument } from "src/schemas";

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
        id: string, bookMarks: Array<number>,
        following: Array<string>,
        follower: Array<string>,
        numSold: number,
        numPurchased: number,
        numPromptSold: number,
        numPromptPurchased: number
    ): Promise<SocialUser> {
        return this.socialUserModel.create(
            {
                id, bookMarks, following, follower,
                numSold, numPurchased, numPromptSold, numPromptPurchased
            }
        );
    }


    async addListBookMark(id: string, postId: number): Promise<any> {
        return this.socialUserModel.updateOne({ id }, { $push: { bookMarks: postId } })
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


}