export const AI_CONFIG = {
    temperature: 0.3,
    maxOutputTokens: 300,
} as const;

export const SUMMARY_PROMPT =
    'Summarize the following story in a concise paragraph of approximately 120–180 words. ' +
    'Capture the main events, key context, and important outcomes while avoiding unnecessary details. ' +
    'Return only the summary text with no preamble, labels, or markdown.';

export const DEFAULT_AI_MODEL = 'gemini-flash-latest';

export const PASSWORD = {
    MIN: 8,
    REQUIRED: 1,
} as const;

export const CATEGORY = {
    MIN: 1,
    MAX: 10,
} as const;

export const QUERY_CONSTANTS = {
    DEFAULT_OFFSET: 0,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,

    MIN_SEARCH_LENGTH: 1,
    MAX_SEARCH_LENGTH: 100,
} as const;

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
} as const;

export enum StatusCode {
    Ok = 200,
    Created = 201,
    Accepted = 202,
    NoContent = 204,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    Conflict = 409,
    UnprocessableEntity = 422,
    TooManyRequests = 429,
    InternalServerError = 500,
    ServiceUnavailable = 503,
}

export const TITLE = {
    MIN: 10,
    MAX: 100,
} as const;

export const BODY = {
    MIN: 100,
    MAX: 10000,
} as const;

export const SUMMARY = {
    MAX_INPUT_CHARS: 6000,
    MIN_CHAR_LENGTH: 1,
    MAX_CHAR_LENGTH: 500,
} as const;

export const USERNAME = {
    MIN: 3,
    MAX: 50,
} as const;

export const NAME = {
    MIN: 1,
    MAX: 100,
} as const;

export const ERROR_MESSAGES = {
    INTERNAL_SERVER_ERROR: 'Internal Server Error',
    SOMETHING_WENT_WRONG: 'Something went wrong',

    VALIDATION_FAILED: 'Validation failed',
    BAD_REQUEST: 'Bad Request',

    MISSING_AUTH_HEADER: 'Missing or malformed authorization header',
    INVALID_TOKEN_PAYLOAD: 'Invalid token payload',
    AUTHENTICATION_REQUIRED: 'Authentication required',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',

    RESOURCE_NOT_FOUND: 'Resource not found',
    ROUTE_NOT_FOUND: 'Route not found',

    USER_NOT_FOUND: 'User not found',
    EMAIL_ALREADY_EXISTS: 'Email already exists',
    USERNAME_ALREADY_EXISTS: 'Username already exists',
    USERNAME_ALREADY_TAKEN: 'Username already taken',
    EMAIL_ALREADY_IN_USE: 'Email already in use',

    STORY_NOT_FOUND: 'Story not found',
    CATEGORIES_NOT_FOUND: 'One or more categories do not exist',

    CATEGORY_NOT_FOUND: 'Category not found.',
    CATEGORY_ALREADY_EXISTS: 'Category already Exists',

    INVALID_OLD_PASSWORD: 'Invalid old password',
    INVALID_PASSWORD_CHANGE_TOKEN: 'Invalid password change token',
    INVALID_OR_EXPIRED_PASSWORD_CHANGE_TOKEN: 'Invalid or expired password change token',
    PASSWORD_MUST_BE_DIFFERENT: 'New password must be different from the old password',
    INVALID_EMAIL_CONFIRMATION_TOKEN: 'Invalid email confirmation token',
    EMAIL_ALREADY_VERIFIED: 'Email is already verified.',

    RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',

    OWN_RESOURCE_REQUIRED: 'You can only modify your own resources',
    OWN_PROFILE_REQUIRED: 'You can only access your own profile',

    AI_SERVICE_FAILED: 'AI service failed to generate summary',

    DATABASE_URL_REQUIRED: 'DATABASE_URL is required to initialize PrismaClient',
    PASSWORD_CHANGE_TOKEN_REQUIRED:
        'Password change token is required to build the confirmation link',
} as const;
