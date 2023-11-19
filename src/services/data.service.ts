import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Data, DataDocument } from "src/schemas";
import { User } from "src/schemas";
import { UserService } from "./user.service";

@Injectable()
export class DataService {
    constructor(
        @InjectModel(Data.name)
        private dataModel: Model<DataDocument>,
    ) { }

    async findDataById(id: number): Promise<Data> {
        return this.dataModel.findOne({ id });
    }

    async createData(data: Data): Promise<Data> {
        return this.dataModel.create(data);
    }

}