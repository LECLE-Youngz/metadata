import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Attribute, ENft, ENftDocument, Metadata } from "src/schemas";
import { NftCollection } from "src/types";

@Injectable()
export class ENftService {
    constructor(
        @InjectModel(ENft.name)
        private eNftModel: Model<ENftDocument>,
    ) { }

    async findAll(): Promise<Array<ENft>> {
        return this.eNftModel.find();
    }

    async findENftByIdAndAddressCollection(id: number, address: string): Promise<ENft> {
        return this.eNftModel.findOne({ id, addressCollection: address });
    }

    async findENftsByListObjectIdWithCollection(eNftCollection: Array<NftCollection>): Promise<Array<ENft>> {
        return this.eNftModel.find({ id: { $in: eNftCollection.map(eNft => eNft.id) }, addressCollection: eNftCollection.map(eNft => eNft.addressCollection) });
    }

    async findListENftIdByAddressCollection(addressCollection: string): Promise<Array<number>> {
        return this.eNftModel.distinct("id", { addressCollection });
    }


    async createENft(
        id: number,
        name: string,
        description: string,
        image: string,
        addressCollection: string,
        meta: Metadata
    ): Promise<ENft> {
        return this.eNftModel.create({
            id,
            name,
            description,
            image,
            addressCollection,
            attributes: [],
            meta
        });
    }

    async deleteENft(id: string) {
        return this.eNftModel.findOneAndDelete({ id })
    }

    async createAttributes(id: string, attribute: Array<Attribute>) {
        return this.eNftModel.updateOne({ id }, { attribute })
    }

    async getAllListCollection(): Promise<Array<String>> {
        return this.eNftModel.distinct("addressCollection");
    }

    async getENftByAddressCollection(addressCollection: string): Promise<Array<number>> {
        return this.eNftModel.distinct("id", { addressCollection });
    }

    async getAllCollection(): Promise<Array<String>> {
        return this, this.eNftModel.distinct("addressCollection");
    }
}
