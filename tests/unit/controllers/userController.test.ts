import type { Request } from 'express';
import { StatusCode } from '../../../src/constants/index.js';
import { UserController } from '../../../src/controllers/user.controller.js';
import {
    buildListUsersQuery,
    buildUpdateUserDTO,
    buildUpdateUserProfileDTO,
    buildUserDTO,
} from '../../factories/user.factory.js';
import { createMockRes } from '../../utils/express.mock.js';

jest.mock('../../../src/services/user.services.js', () => {
    const mockService = {
        getAllUsers: jest.fn(),
        getUserById: jest.fn(),
        getUserProfile: jest.fn(),
        updateUser: jest.fn(),
        updateUserProfile: jest.fn(),
        softDelete: jest.fn(),
    };

    return {
        UserService: jest.fn().mockImplementation(() => mockService),
        __mockService: mockService,
    };
});

const { __mockService: userServiceMock } = jest.requireMock(
    '../../../src/services/user.services.js',
) as {
    __mockService: {
        getAllUsers: jest.Mock;
        getUserById: jest.Mock;
        getUserProfile: jest.Mock;
        updateUser: jest.Mock;
        updateUserProfile: jest.Mock;
        softDelete: jest.Mock;
    };
};

beforeEach(() => {
    userServiceMock.getAllUsers.mockReset();
    userServiceMock.getUserById.mockReset();
    userServiceMock.getUserProfile.mockReset();
    userServiceMock.updateUser.mockReset();
    userServiceMock.updateUserProfile.mockReset();
    userServiceMock.softDelete.mockReset();
});

describe('UserController', () => {
    describe('getAllUsers', () => {
        it('returns 200 with the service payload', async () => {
            const query = buildListUsersQuery();
            const payload = {
                data: [buildUserDTO(), buildUserDTO()],
                meta: { offset: 0, limit: 10, total: 2 },
            };
            userServiceMock.getAllUsers.mockResolvedValue(payload);
            const req = { validated: { query } } as unknown as Request;
            const res = createMockRes();

            await UserController.getAllUsers(req, res);

            expect(userServiceMock.getAllUsers).toHaveBeenCalledWith(query);
            expect(res.status).toHaveBeenCalledWith(StatusCode.Ok);
            expect(res.json).toHaveBeenCalledWith(payload);
        });
    });

    describe('getUserById', () => {
        it('returns 200 with the user', async () => {
            const user = buildUserDTO({ id: 'u-1' });
            userServiceMock.getUserById.mockResolvedValue(user);
            const req = {
                validated: { params: { userId: 'u-1' } },
            } as unknown as Request;
            const res = createMockRes();

            await UserController.getUserById(req, res);

            expect(userServiceMock.getUserById).toHaveBeenCalledWith('u-1');
            expect(res.status).toHaveBeenCalledWith(StatusCode.Ok);
            expect(res.json).toHaveBeenCalledWith(user);
        });
    });

    describe('getProfile', () => {
        it('returns 200 with the authenticated user profile', async () => {
            const user = buildUserDTO({ id: 'me' });
            userServiceMock.getUserProfile.mockResolvedValue(user);
            const req = { user: { id: 'me' } } as unknown as Request;
            const res = createMockRes();

            await UserController.getProfile(req, res);

            expect(userServiceMock.getUserProfile).toHaveBeenCalledWith('me');
            expect(res.status).toHaveBeenCalledWith(StatusCode.Ok);
            expect(res.json).toHaveBeenCalledWith(user);
        });
    });

    describe('updateUser', () => {
        it('returns 200 with the updated user', async () => {
            const data = buildUpdateUserDTO({ name: 'New' });
            const user = buildUserDTO({ name: 'New' });
            userServiceMock.updateUser.mockResolvedValue(user);
            const req = {
                validated: { params: { userId: 'u-1' }, body: data },
            } as unknown as Request;
            const res = createMockRes();

            await UserController.updateUser(req, res);

            expect(userServiceMock.updateUser).toHaveBeenCalledWith('u-1', data);
            expect(res.status).toHaveBeenCalledWith(StatusCode.Ok);
            expect(res.json).toHaveBeenCalledWith(user);
        });
    });

    describe('updateProfile', () => {
        it('returns 200 with the updated profile', async () => {
            const data = buildUpdateUserProfileDTO({ name: 'Updated' });
            const user = buildUserDTO({ name: 'Updated' });
            userServiceMock.updateUserProfile.mockResolvedValue(user);
            const req = {
                user: { id: 'me' },
                validated: { body: data },
            } as unknown as Request;
            const res = createMockRes();

            await UserController.updateProfile(req, res);

            expect(userServiceMock.updateUserProfile).toHaveBeenCalledWith('me', data);
            expect(res.status).toHaveBeenCalledWith(StatusCode.Ok);
            expect(res.json).toHaveBeenCalledWith(user);
        });
    });

    describe('deleteUser', () => {
        it('returns 200 with a success message and calls softDelete on the service', async () => {
            userServiceMock.softDelete.mockResolvedValue(buildUserDTO());
            const req = {
                validated: { params: { userId: 'u-1' } },
            } as unknown as Request;
            const res = createMockRes();

            await UserController.deleteUser(req, res);

            expect(userServiceMock.softDelete).toHaveBeenCalledWith('u-1');
            expect(res.status).toHaveBeenCalledWith(StatusCode.Ok);
            expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
        });
    });

    describe('error propagation', () => {
        it('does not catch service errors; lets them bubble up to error middleware', async () => {
            userServiceMock.getUserById.mockRejectedValue(new Error('boom'));
            const req = {
                validated: { params: { userId: 'u-1' } },
            } as unknown as Request;
            const res = createMockRes();

            await expect(UserController.getUserById(req, res)).rejects.toThrow('boom');
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });
});
