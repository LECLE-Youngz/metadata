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

    async findSocialUserById(id: number): Promise<SocialUser> {
        return this.socialUserModel.findOne({ id });
    }

    async initSocialUser(id: number): Promise<SocialUser> {
        return this.socialUserModel.create({ id });
    }

    async createSocialUser(socialUser: SocialUser): Promise<SocialUser> {
        return this.socialUserModel.create(socialUser);
    }

    async addListFlow(id: number, flowingId: number): Promise<any> {
        await this.socialUserModel.updateOne({ id: flowingId }, { $push: { follower: id } })
        return this.socialUserModel.updateOne({ id }, { $push: { flowing: flowingId } })
    }

    async removeListFlow(id: number, flowingId: number): Promise<any> {
        await this.socialUserModel.updateOne({ id: flowingId }, { $pull: { follower: id } })
        return this.socialUserModel.updateOne({ id }, { $pull: { flowing: flowingId } })
    }

    async addListBookMark(id: number, postId: number): Promise<any> {
        return this.socialUserModel.updateOne({ id }, { $push: { bookMarks: postId } })
    }

    async findAll(): Promise<Array<SocialUser>> {
        return this.socialUserModel.find();
    }

    async findSocialUserByListId(ids: number[]): Promise<Array<SocialUser>> {
        return this.socialUserModel.find({ id: { $in: ids } });
    }

    async findListFlowingById(id: number): Promise<Array<number>> {
        const socialUser = await this.socialUserModel.findOne({ id })
        return socialUser.following;
    }

    async findListFollowerById(id: number): Promise<Array<number>> {
        const socialUser = await this.socialUserModel.findOne({ id })
        return socialUser.follower;
    }

    async findListBookMarksById(id: number): Promise<Array<number>> {
        const socialUser = await this.socialUserModel.findOne({ id })
        return socialUser.bookMarks
    }

}