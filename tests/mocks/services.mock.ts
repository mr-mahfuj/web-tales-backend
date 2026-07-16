import type { UserService } from '../../src/services/user.services.js';

export type UserServiceMock = jest.Mocked<UserService>;

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
