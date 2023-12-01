import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Data, DataDocument, Metadata } from "src/schemas";
import { NftCollection } from "src/types";
@Injectable()
export class DataService {
    constructor(
        @InjectModel(Data.name)
        private dataModel: Model<DataDocument>,
    ) { }

    async findDataByIdAndAddressCollection(id: number, addressCollection): Promise<Data> {
        return this.dataModel.findOne({ id, addressCollection });
    }
    async findDataByListIdAndCollection(NftCollection): Promise<Array<Data>> {
        return this.dataModel.find({ id: { $in: NftCollection.map(nft => nft.id) }, addressCollection: NftCollection.map(nft => nft.addressCollection) });
    }

    async createData(id: number, addressCollection: string, meta: Metadata,): Promise<Data> {
        return this.dataModel.create({
            id,
            addressCollection,
            meta,
        });
    }


}