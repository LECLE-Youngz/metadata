import { Module } from '@nestjs/common';
import * as controllers from './controllers';
import * as services from './services';
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  User,
  UserSchema,
  Nft,
  NftSchema,
  Data,
  DataSchema,
  Comment,
  CommentSchema,
  Post,
  PostSchema,
  SocialUser,
  SocialUserSchema,
  Wallet,
  WalletSchema,
} from "./schemas";
import configuration from "src/configs/configuration";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration]
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          uri: configService.get<string>("database.mongo_url"),
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Nft.name, schema: NftSchema },
      { name: Data.name, schema: DataSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Post.name, schema: PostSchema },
      { name: SocialUser.name, schema: SocialUserSchema },
      { name: Wallet.name, schema: WalletSchema },
    ]),
    ConfigModule
  ],
  controllers: [].concat(Object.values(controllers)),
  providers: [].concat(Object.values(services)),
})
export class AppModule { }
