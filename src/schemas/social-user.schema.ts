import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type SocialUserDocument = HydratedDocument<SocialUser>;

export class Ranking {
    numSold: number;

    numPurchased: number;

    numPromptSold: number;

    numPromptPurchased: number;
}

@Schema()
export class SocialUser {
    constructor(id: string) {
        this.id = id;
        this.bookMarks = [];
        this.following = [];
        this.follower = [];
        this.ranking = {
            numSold: 0,
            numPurchased: 0,
            numPromptSold: 0,
            numPromptPurchased: 0
        }
    }
    @Prop({ required: true, unique: true, index: true, sparse: true })
    id: string; //user Id

    @Prop({ required: true })
    bookMarks: Array<string>; //post Id

    @Prop({ required: true })
    following: Array<string>; //user Id

    @Prop({ required: true })
    follower: Array<string>; //user Id

    @Prop({ required: true })
    ranking: Ranking;

}

export const SocialUserSchema = SchemaFactory.createForClass(SocialUser);
