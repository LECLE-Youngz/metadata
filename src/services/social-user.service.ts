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

    async updateSocialUser(socialUser: SocialUser): Promise<any> {
        return this.socialUserModel.updateOne({ id: socialUser.id }, socialUser);
    }

    async findAll(): Promise<Array<SocialUser>> {
        return this.socialUserModel.find();
    }

    async findSocialUserByListId(ids: number[]): Promise<Array<SocialUser>> {
        return this.socialUserModel.find({ id: { $in: ids } });
    }

}