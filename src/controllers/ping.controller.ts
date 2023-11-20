import {
    Controller, Get
} from "@nestjs/common";


@Controller("api/v1/ping")
export class PingController {
    @Get()
    async ping() {
        return "Server is running";
    }
}