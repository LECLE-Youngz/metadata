import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Data, DataDocument, Metadata } from "src/schemas";

@Injectable()
export class DataService {
    constructor(
        @InjectModel(Data.name)
        private dataModel: Model<DataDocument>,
    ) { }

    async findDataById(id: number): Promise<Data> {
        return this.dataModel.findOne({ id });
    }
    async findDataByListId(ids: number[]): Promise<Array<Data>> {
        return this.dataModel.find({ id: { $in: ids } });

    }

    async createData(id: number, meta: Metadata,): Promise<Data> {
        return this.dataModel.create({
            id,
            meta,
        });
    }


}