import { Role, type User } from '@prisma/client';
import type { CreateUserDTO, UpdateUserDTO, UpdateUserProfileDTO } from '../../src/dtos/userDTO.js';
import type { ListUsersQuery } from '../../src/schemas/userSchema.js';
import { UserDTO } from '../../src/dtos/userDTO.js';

let counter = 0;
const nextId = () => `user-${++counter}`;
const nextUsername = () => `user_${counter}`;
const nextEmail = () => `user${counter}@example.com`;
const nextName = () => `User Number ${counter}`;

export function buildUser(overrides: Partial<User> = {}): User {
    return {
        id: nextId(),
        username: nextUsername(),
        name: nextName(),
        email: nextEmail(),
        joinDate: new Date('2026-01-01T00:00:00.000Z'),
        role: Role.USER,
        isDeleted: false,
        isEmailVerified: false,
        ...overrides,
    };
}

export function buildUserList(count = 3): User[] {
    return Array.from({ length: count }, (_, index) =>
        buildUser({ username: `user_${index}`, email: `user${index}@example.com` }),
    );
}

export function buildUserDTO(overrides: Partial<User> = {}): UserDTO {
    return new UserDTO(buildUser(overrides));
}

export function buildCreateUserDTO(overrides: Partial<CreateUserDTO> = {}): CreateUserDTO {
    return {
        username: nextUsername(),
        name: nextName(),
        email: nextEmail(),
        ...overrides,
    };
}

export function buildUpdateUserDTO(overrides: Partial<UpdateUserDTO> = {}): UpdateUserDTO {
    return {
        username: nextUsername(),
        name: nextName(),
        email: nextEmail(),
        ...overrides,
    };
}

export function buildUpdateUserProfileDTO(
    overrides: Partial<UpdateUserProfileDTO> = {},
): UpdateUserProfileDTO {
    return {
        name: nextName(),
        ...overrides,
    };
}

export function buildListUsersQuery(overrides: Partial<ListUsersQuery> = {}): ListUsersQuery {
    return {
        offset: 0,
        limit: 10,
        orderBy: 'joinDate',
        count: false,
        ...overrides,
    };
}
