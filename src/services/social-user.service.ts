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

    async addListFlow(id: string, flowingId: string): Promise<any> {
        await this.socialUserModel.updateOne({ id: flowingId }, { $push: { follower: id } })
        return this.socialUserModel.updateOne({ id }, { $push: { flowing: flowingId } })
    }

    async removeListFlow(id: string, flowingId: string): Promise<any> {
        await this.socialUserModel.updateOne({ id: flowingId }, { $pull: { follower: id } })
        return this.socialUserModel.updateOne({ id }, { $pull: { flowing: flowingId } })
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
        const socialUser = await this.findSocialUserById(id);
        const flowingUser = await this.findSocialUserById(flowingId);
        if (!socialUser.following.includes(flowingId) && !flowingUser.follower.includes(id)) {
            await this.addListFlow(id, flowingId)
            await this.addListFlow(flowingId, id)
            return { status: 'flowing' }


        } else {
            await this.removeListFlow(id, flowingId)
            await this.removeListFlow(flowingId, id)
            return { status: 'unflowing' }
        }

    }

    // async findListBookMarksById(id: number): Promise<Array<number>> {
    //     const socialUser = await this.socialUserModel.findOne({ id })
    //     return socialUser.bookMarks
    // }

}