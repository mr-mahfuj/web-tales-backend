export const PASSWORD_RATE_LIMITS = {
    CHANGE_PASSWORD: {
        windowMs: 15 * 60 * 1000,
        max: 5,
    },
    CONFIRM_PASSWORD_CHANGE: {
        windowMs: 15 * 60 * 1000,
        max: 10,
    },
} as const;

export const STORY_RATE_LIMITS = {
    windowMs: 60 * 1000,
    max: 5,
};
