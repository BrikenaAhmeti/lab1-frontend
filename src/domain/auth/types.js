export function toAuthSession(payload) {
    return {
        user: payload.user,
        tokens: {
            accessToken: payload.accessToken,
            refreshToken: payload.refreshToken,
        },
    };
}
