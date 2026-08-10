import type { RequestHandler } from 'express';
import { BadRequestError, ForbiddenError, NotFoundError } from '../common/errors.js';
import { ERROR_MESSAGES } from '../constants/index.js';
import type { AuthenticatedUser } from '../types/auth.js';
import { StoryService } from '../services/story.service.js';
import { Role } from '@prisma/client';

const storyService = new StoryService();

async function isOwner(storyId: string, userId: string): Promise<boolean> {
    const story = await storyService.getStoryById(storyId);

    if (!story) {
        throw new NotFoundError(ERROR_MESSAGES.STORY_NOT_FOUND);
    }

    return story.userId === userId;
}

export function requireAccess(
    ownerAccess: boolean,
    ...roles: AuthenticatedUser['role'][]
): RequestHandler {
    return async function requireAccessMiddleware(req, _res, next) {
        try {
            if (!req.user) {
                return next(new ForbiddenError(ERROR_MESSAGES.AUTHENTICATION_REQUIRED));
            }

            if (!roles.includes(req.user.role)) {
                return next(new ForbiddenError(ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS));
            }

            if (req.user.role === Role.ADMIN) {
                return next();
            }

            if (!ownerAccess) {
                return next();
            }

            const storyId = typeof req.params.storyId === 'string' ? req.params.storyId : undefined;
            const userId = typeof req.params.userId === 'string' ? req.params.userId : undefined;

            if (storyId) {
                const owner = await isOwner(storyId, req.user.id);

                if (!owner) {
                    return next(new ForbiddenError(ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS));
                }

                return next();
            }

            if (userId) {
                if (req.user.id !== userId) {
                    return next(new ForbiddenError(ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS));
                }
                return next();
            }

            return next(new BadRequestError());
        } catch (err) {
            return next(err);
        }
    };
}
