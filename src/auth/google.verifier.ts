import { request } from 'gaxios';
import { User } from '../schemas';

export async function verifyAccessToken(accessToken: string) {
    const userinfoUrl = 'https://www.googleapis.com/oauth2/v1/userinfo';
    const headers = {
        Authorization: accessToken,
    };

    try {
        const response = await request<User>({
            url: userinfoUrl,
            headers,
        });

        // Assuming the response.data is of type User
        return response.data;
    } catch (error) {
        // Handle errors
        throw new Error('Failed to verify access token');
    }
}