import type { UserService } from '../../src/services/user.services.js';
import type { StoryService } from '../../src/services/story.service.js';

export type UserServiceMock = jest.Mocked<UserService>;
export type StoryServiceMock = jest.Mocked<StoryService>;

export function createUserServiceMock(): UserServiceMock {
    return {
        createUser: jest.fn(),
        getAllUsers: jest.fn(),
        getUserById: jest.fn(),
        getUserByEmail: jest.fn(),
        getUserProfile: jest.fn(),
        findUserByEmail: jest.fn(),
        markEmailVerified: jest.fn(),
        updateUser: jest.fn(),
        updateUserProfile: jest.fn(),
        softDelete: jest.fn(),
        existsByUsername: jest.fn(),
        existsByEmail: jest.fn(),
        userRepository: {} as never,
    } as unknown as UserServiceMock;
}

export function createStoryServiceMock(): StoryServiceMock {
    return {
        createStory: jest.fn(),
        getAllStorys: jest.fn(),
        getStoryById: jest.fn(),
        updateStory: jest.fn(),
        generateStorySummary: jest.fn(),
        delete: jest.fn(),
        getStoryOwnerId: jest.fn(),
        storyRepository: {} as never,
    } as unknown as StoryServiceMock;
}
