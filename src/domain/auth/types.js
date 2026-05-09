export function toAuthSession(payload, user = payload.user) {
    if (!user) {
        throw new Error('User is required to create an auth session');
    }
    return {
        user,
        tokens: {
            accessToken: payload.accessToken,
        },
    };
}
