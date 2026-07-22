import type { Request } from 'express';
import { StatusCode } from '../../../src/constants/index.js';
import { AuthController } from '../../../src/controllers/auth.controller.js';
import {
    buildRegisterDTO,
    buildLoginDTO,
    buildInitiatePasswordChangeDTO,
    buildConfirmPasswordChangeDTO,
    buildResendConfirmationEmailDTO,
} from '../../factories/auth.factory.js';
import { createMockRes } from '../../utils/express.mock.js';

jest.mock('../../../src/services/auth.service.js', () => {
    const mockService = {
        register: jest.fn(),
        login: jest.fn(),
        confirmEmail: jest.fn(),
        resendConfirmationEmail: jest.fn(),
        initiatePasswordChange: jest.fn(),
        confirmPasswordChange: jest.fn(),
        validatePasswordChangeToken: jest.fn(),
    };

    return {
        AuthService: jest.fn().mockImplementation(() => mockService),
        __mockService: mockService,
    };
});

const { __mockService: authServiceMock } = jest.requireMock(
    '../../../src/services/auth.service.js',
) as {
    __mockService: {
        register: jest.Mock;
        login: jest.Mock;
        confirmEmail: jest.Mock;
        resendConfirmationEmail: jest.Mock;
        initiatePasswordChange: jest.Mock;
        confirmPasswordChange: jest.Mock;
        validatePasswordChangeToken: jest.Mock;
    };
};

beforeEach(() => {
    authServiceMock.register.mockReset();
    authServiceMock.login.mockReset();
    authServiceMock.confirmEmail.mockReset();
    authServiceMock.resendConfirmationEmail.mockReset();
    authServiceMock.initiatePasswordChange.mockReset();
    authServiceMock.confirmPasswordChange.mockReset();
    authServiceMock.validatePasswordChangeToken.mockReset();
});

describe('AuthController', () => {
    describe('register', () => {
        it('returns 201 with the registered user', async () => {
            const body = buildRegisterDTO();
            const payload = {
                user: { id: 'u-1', username: body.username, name: body.name, email: body.email },
            };
            authServiceMock.register.mockResolvedValue(payload);
            const req = { validated: { body } } as unknown as Request;
            const res = createMockRes();

            await AuthController.register(req, res);

            expect(authServiceMock.register).toHaveBeenCalledWith(body);
            expect(res.status).toHaveBeenCalledWith(StatusCode.Created);
            expect(res.json).toHaveBeenCalledWith(payload);
        });
    });

    describe('login', () => {
        it('returns 200 with the token and user', async () => {
            const body = buildLoginDTO();
            const payload = {
                token: 'jwt-token',
                user: { id: 'u-1', username: 'johndoe', name: 'John Doe', email: body.email },
            };
            authServiceMock.login.mockResolvedValue(payload);
            const req = { validated: { body } } as unknown as Request;
            const res = createMockRes();

            await AuthController.login(req, res);

            expect(authServiceMock.login).toHaveBeenCalledWith(body);
            expect(res.status).toHaveBeenCalledWith(StatusCode.Ok);
            expect(res.json).toHaveBeenCalledWith(payload);
        });
    });

    describe('confirmEmail', () => {
        it('confirms the email and returns 204', async () => {
            authServiceMock.confirmEmail.mockResolvedValue(undefined);
            const req = { validated: { params: { token: 'email-token' } } } as unknown as Request;
            const res = createMockRes();

            await AuthController.confirmEmail(req, res);

            expect(authServiceMock.confirmEmail).toHaveBeenCalledWith('email-token');
            expect(res.sendStatus).toHaveBeenCalledWith(StatusCode.NoContent);
        });
    });

    describe('resendConfirmationEmail', () => {
        it('resends the confirmation email and returns 204', async () => {
            const body = buildResendConfirmationEmailDTO();
            authServiceMock.resendConfirmationEmail.mockResolvedValue(undefined);
            const req = { validated: { body } } as unknown as Request;
            const res = createMockRes();

            await AuthController.resendConfirmationEmail(req, res);

            expect(authServiceMock.resendConfirmationEmail).toHaveBeenCalledWith(body);
            expect(res.sendStatus).toHaveBeenCalledWith(StatusCode.NoContent);
        });
    });

    describe('initiatePasswordChange', () => {
        it('initiates the password change and returns 204', async () => {
            const body = buildInitiatePasswordChangeDTO();
            authServiceMock.initiatePasswordChange.mockResolvedValue(undefined);
            const req = { user: { id: 'u-1' }, validated: { body } } as unknown as Request;
            const res = createMockRes();

            await AuthController.initiatePasswordChange(req, res);

            expect(authServiceMock.initiatePasswordChange).toHaveBeenCalledWith('u-1', body);
            expect(res.sendStatus).toHaveBeenCalledWith(StatusCode.NoContent);
        });
    });

    describe('confirmPasswordChange', () => {
        it('confirms the password change and returns 204', async () => {
            const body = buildConfirmPasswordChangeDTO();
            authServiceMock.confirmPasswordChange.mockResolvedValue(undefined);
            const req = { validated: { body } } as unknown as Request;
            const res = createMockRes();

            await AuthController.confirmPasswordChange(req, res);

            expect(authServiceMock.confirmPasswordChange).toHaveBeenCalledWith(body);
            expect(res.sendStatus).toHaveBeenCalledWith(StatusCode.NoContent);
        });
    });

    describe('validatePasswordChangeToken', () => {
        it('returns 200 with the validated token', async () => {
            authServiceMock.validatePasswordChangeToken.mockResolvedValue({
                token: 'change-token',
            });
            const req = {
                validated: { params: { token: 'change-token' } },
            } as unknown as Request;
            const res = createMockRes();

            await AuthController.validatePasswordChangeToken(req, res);

            expect(authServiceMock.validatePasswordChangeToken).toHaveBeenCalledWith(
                'change-token',
            );
            expect(res.status).toHaveBeenCalledWith(StatusCode.Ok);
            expect(res.json).toHaveBeenCalledWith({ token: 'change-token' });
        });
    });

    describe('error propagation', () => {
        it('does not catch service errors; lets them bubble up to error middleware', async () => {
            authServiceMock.login.mockRejectedValue(new Error('boom'));
            const req = { validated: { body: buildLoginDTO() } } as unknown as Request;
            const res = createMockRes();

            await expect(AuthController.login(req, res)).rejects.toThrow('boom');
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });
});
