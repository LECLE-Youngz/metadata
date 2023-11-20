import axios from "axios";
import { User } from "../schemas";
export async function verifyAccessToken(accessToken: string) {
    const userinfoUrl = "https://www.googleapis.com/oauth2/v1/userinfo";
    const response = await axios.get(userinfoUrl, {
        headers: {
            Authorization: accessToken,
        },
    });
    if (response.status !== 200) {
        throw new Error("Failed to verify access token");
    }
    return await response.data as User;

}