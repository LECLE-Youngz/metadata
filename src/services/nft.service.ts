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

    async findNftById(id: number): Promise<Nft> {
        return this.nftModel.findOne({ id });
    }

    async findNftsByListId(id: number[]): Promise<Array<Nft>> {
        return this.nftModel.find({ id: { $in: id } });
    }

    async findNftsByOwnerId(ownerId: string): Promise<Array<Nft>> {
        return this.nftModel.find({ ownerId });
    }

    async createNft(
        id: number,
        ownerId: string,
        name: string,
        thumbnail: string,
        price: string,
        promptPrice: string,
        promptBuyer: string[],
        promptAllower: string[],
    ): Promise<Nft> {
        return this.nftModel.create({
            id,
            ownerId,
            name,
            thumbnail,
            price,
            promptPrice,
            promptBuyer,
            promptAllower
        });
    }

    async deleteNft(nftId: string) {
        return this.nftModel.findOneAndDelete({ nftId })
    }
}