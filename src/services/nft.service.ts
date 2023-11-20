import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Nft, NftDocument } from "src/schemas";

@Injectable()
export class NftService {
    constructor(
        @InjectModel(Nft.name)
        private nftModel: Model<NftDocument>,
    ) { }

    async findAll(): Promise<Array<Nft>> {
        return this.nftModel.find();
    }

    async findNftById(nftId: number): Promise<Nft> {
        return this.nftModel.findOne({ nftId });
    }

    async findNftsByListId(nftIds: number[]): Promise<Array<Nft>> {
        return this.nftModel.find({ nftId: { $in: nftIds } });
    }

    async findNftsByOwnerId(ownerId: string): Promise<Array<Nft>> {
        return this.nftModel.find({ ownerId });
    }

    async createNft(nft: Nft): Promise<Nft> {
        return this.nftModel.create(nft);
    }

    async deleteNft(nftId: string) {
        return this.nftModel.findOneAndDelete({ nftId })
    }
}