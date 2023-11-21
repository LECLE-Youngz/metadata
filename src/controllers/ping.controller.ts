import {
    Controller, Get
} from "@nestjs/common";


@Controller()
export class PingController {
    @Get()
    async ping() {
        return "Server is running";
    }
}