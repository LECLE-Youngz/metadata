import { Module } from '@nestjs/common';
import * as controllers from './controllers';
import * as services from './services';
import { MongooseModule } from "@nestjs/mongoose";
import * as dotenv from "dotenv";
dotenv.config();

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => {
        return {
          uri: process.env.MONGO_URL,
        };
      },
    }),
    MongooseModule.forFeature([

    ]),
  ],
  controllers: [].concat(Object.values(controllers)),
  providers: [].concat(Object.values(services)),
})
export class AppModule { }
