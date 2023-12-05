import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Attribute, Nft, NftDocument } from "src/schemas";
import { NftCollection } from "src/types";

@Injectable()
export class NftService {
    constructor(
        @InjectModel(Nft.name)
        private nftModel: Model<NftDocument>,
    ) { }

    async findAll(): Promise<Array<Nft>> {
        return this.nftModel.find();
    }

    async findNftByIdAndAddressCollection(id: number, address: string): Promise<Nft> {
        return this.nftModel.findOne({ id, addressCollection: address });
    }

    async findNftsByListObjectIdWithCollection(nftCollection: Array<NftCollection>): Promise<Array<Nft>> {
        return this.nftModel.find({ id: { $in: nftCollection.map(nft => nft.id) }, addressCollection: nftCollection.map(nft => nft.addressCollection) });
    }

    async findListNftIdByAddressCollection(addressCollection: string): Promise<Array<number>> {
        return this.nftModel.distinct("id", { addressCollection });
    }


    async createNft(
        id: number,
        name: string,
        description: string,
        image: string,
        addressCollection: string,
    ): Promise<Nft> {
        return this.nftModel.create({
            id,
            name,
            description,
            image,
            addressCollection,
            attributes: [],
        });
    }

    async deleteNft(nftId: string) {
        return this.nftModel.findOneAndDelete({ nftId })
    }

    async createAttributes(nftId: string, attribute: Array<Attribute>) {
        return this.nftModel.updateOne({ nftId }, { attribute })
    }

    async getAllListCollection(): Promise<Array<String>> {
        return this.nftModel.distinct("addressCollection");
    }

    async getNftByAddressCollection(addressCollection: string): Promise<Array<number>> {
        return this.nftModel.distinct("id", { addressCollection });
    }

    async getAllCollection(): Promise<Array<String>> {
        return this.nftModel.distinct("addressCollection");
    }
}
