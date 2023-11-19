import axios from "axios";
import { User } from "../schemas";
export async function verifyAccessToken(accessToken: string, address?: string) {
    const userinfoUrl = "https://www.googleapis.com/oauth2/v1/userinfo";
    const response = await axios.get(userinfoUrl, {
        headers: {
            Authorization: accessToken,
        },
    });
    const res = await response.data;
    const user: User = {
        id: res.id,
        name: res.name,
        given_name: res.given_name,
        family_name: res.family_name,
        picture: res.picture,
        locale: res.locale,
        verified_email: res.verified_email,
        address: address ? address : "",
        email: res.email,
    }
    return user;
}