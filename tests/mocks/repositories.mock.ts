import type { UserRepository } from '../../src/repositories/user.repository.js';

export type UserRepositoryMock = jest.Mocked<UserRepository>;

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
