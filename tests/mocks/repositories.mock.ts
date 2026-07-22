import type { StoryRepository } from '../../src/repositories/story.repository.js';
import type { UserRepository } from '../../src/repositories/user.repository.js';

export type UserRepositoryMock = jest.Mocked<UserRepository>;
export type StoryRepositoryMock = jest.Mocked<StoryRepository>;

export function createUserRepositoryMock(): UserRepositoryMock {
    return {
        create: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        findByEmail: jest.fn(),
        findByUsername: jest.fn(),
        existsByEmail: jest.fn(),
        existsByUsername: jest.fn(),
        existsByEmailExcludingUser: jest.fn(),
        existsByUsernameExcludingUser: jest.fn(),
        update: jest.fn(),
        markEmailVerified: jest.fn(),
        softDelete: jest.fn(),
    } as unknown as UserRepositoryMock;
}

export function createStoryRepositoryMock(): StoryRepositoryMock {
    return {
        create: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        existsById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    } as unknown as StoryRepositoryMock;
}
