type SocialPlatform = "github" | "kakao";

export function socialStart(platform: SocialPlatform) {
    interface SocialInfo {
        baseUrl: string;
        params: {
            client_id: string;
            scope?: string;
            allow_signup?: string;
            redirect_uri?: string;
            response_type?: string;
        };
    };
    const social: Record<SocialPlatform, SocialInfo> = {
        github: {
            baseUrl: "https://github.com/login/oauth/authorize",
            params: {
                client_id: process.env.GITHUB_CLIENT_ID!,
                scope: "read:user,user:email",
                allow_signup: "false",
            },
        },
        kakao: {
            baseUrl: "https://kauth.kakao.com/oauth/authorize",
            params: {
                client_id: process.env.KAKAO_CLIENT_ID!,  // Assuming this is correctly defined in your environment
                redirect_uri: "http://localhost:3000/kakao/complete",
                response_type: "code",
            },
        },
    };
    const platformDetails = social[platform];
    const formattedParams = new URLSearchParams(platformDetails.params).toString();
    const finalUrl = `${platformDetails.baseUrl}?${formattedParams}`;
    return finalUrl;
};

export async function socialToken(platform: SocialPlatform, code: string) {
    interface SocialInfo {
        tokenUrl: string;
        tokenParams: {
            client_id: string;
            client_secret: string;
            code: string;
            grant_type?: string;
            redirect_uri?: string;
        };
    };
    const social: Record<SocialPlatform, SocialInfo> = {
        github: {
            tokenUrl: "https://github.com/login/oauth/access_token",
            tokenParams: {
                client_id: process.env.GITHUB_CLIENT_ID!,
                client_secret: process.env.GITHUB_CLIENT_SECRET!,
                code,
            },
        },
        kakao: {
            tokenUrl: "https://kauth.kakao.com/oauth/token",
            tokenParams: {
                client_id: process.env.KAKAO_CLIENT_ID!,
                client_secret: process.env.KAKAO_CLIENT_SECRET!,
                code,
                grant_type: "authorization_code",
                redirect_uri: "http://localhost:3000/kakao/complete",
            },
        },
    };
    const platformDetails = social[platform];
    const accessTokenParams = new URLSearchParams(platformDetails.tokenParams).toString();
    const accessTokenURL = `${platformDetails.tokenUrl}?${accessTokenParams}`;
    const accessTokenResponse = await fetch(accessTokenURL, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
    });
    const accessToken = await accessTokenResponse.json();
    return accessToken;
};

export async function socialUser(
        platform: SocialPlatform,
        access_token: string,
        tokenUrl?: string
    ) {
    interface TokenUrl {
        tokenUrl: string;
    };
    const social: Record<SocialPlatform, TokenUrl> = {
        github: {
            tokenUrl: "https://api.github.com/user",
        },
        kakao: {
            tokenUrl: "https://kapi.kakao.com/v2/user/me",
        },
    };
    const platformDetails = social[platform];
    const fetchUrl = tokenUrl ? tokenUrl : platformDetails.tokenUrl;
    const userProfileResponse = await fetch(fetchUrl, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        cache: "no-cache",
    });
    const userProfile = await userProfileResponse.json();
    return userProfile;
};