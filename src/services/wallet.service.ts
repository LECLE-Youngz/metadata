import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Wallet, WalletDocument } from "src/schemas";

@Injectable()
export class WalletService {
    constructor(
        @InjectModel(Wallet.name)
        private userModel: Model<WalletDocument>,
    ) { }

    async findWalletById(id: number): Promise<Wallet> {
        return this.userModel.findOne({ id });
    }

    async createWallet(id: number, address: String): Promise<Wallet> {
        return this.userModel.create({ id, address });
    }

    async findAll(): Promise<Array<Wallet>> {
        return this.userModel.find();
    }

    async updateWallet(id: number, address: string): Promise<any> {
        return this.userModel.updateOne({ id }, { address })
    }

    async findWalletByListId(ids: number[]): Promise<Array<Wallet>> {
        return this.userModel.find({ id: { $in: ids } });
    }

}