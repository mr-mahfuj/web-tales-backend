import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthService } from '../../../src/services/auth.service.js';
import {
    ConflictError,
    NotFoundError,
    UnauthorizedError,
    ValidationError,
} from '../../../src/common/errors.js';
import { ERROR_MESSAGES } from '../../../src/constants/index.js';
import {
    buildRegisterDTO,
    buildLoginDTO,
    buildInitiatePasswordChangeDTO,
    buildConfirmPasswordChangeDTO,
    buildResendConfirmationEmailDTO,
    buildAuth,
} from '../../factories/auth.factory.js';
import { buildUser } from '../../factories/user.factory.js';

jest.mock('bcrypt', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
    verify: jest.fn(),
}));

jest.mock('../../../src/config/env.js', () => ({
    env: {
        jwtSecret: 'test-secret',
        jwtExpiresIn: '1h',
        saltRounds: 10,
        passwordChangeTokenExpiresIn: '1h',
    },
}));

jest.mock('../../../src/utils/mailer.js', () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    sendEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordChangeConfirmationEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordChangedNotification: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../src/utils/emailTokenGenerator.js', () => ({
    generatePasswordChangeToken: jest.fn(),
}));

jest.mock('../../../src/repositories/auth.repository.js', () => {
    const mockRepo = {
        createUserWithAuth: jest.fn(),
        findAuthByUserId: jest.fn(),
        setPasswordChangeToken: jest.fn(),
        changePasswordAndConsumeToken: jest.fn(),
    };
    return {
        AuthRepository: jest.fn().mockImplementation(() => mockRepo),
        __mockRepo: mockRepo,
    };
});

jest.mock('../../../src/services/user.services.js', () => {
    const mockService = {
        existsByEmail: jest.fn(),
        existsByUsername: jest.fn(),
        findUserByEmail: jest.fn(),
        getUserById: jest.fn(),
        markEmailVerified: jest.fn(),
    };
    return {
        UserService: jest.fn().mockImplementation(() => mockService),
        __mockService: mockService,
    };
});

const { __mockRepo: authRepositoryMock } = jest.requireMock(
    '../../../src/repositories/auth.repository.js',
) as {
    __mockRepo: {
        createUserWithAuth: jest.Mock;
        findAuthByUserId: jest.Mock;
        setPasswordChangeToken: jest.Mock;
        changePasswordAndConsumeToken: jest.Mock;
    };
};

const { __mockService: userServiceMock } = jest.requireMock(
    '../../../src/services/user.services.js',
) as {
    __mockService: {
        existsByEmail: jest.Mock;
        existsByUsername: jest.Mock;
        findUserByEmail: jest.Mock;
        getUserById: jest.Mock;
        markEmailVerified: jest.Mock;
    };
};

const { generatePasswordChangeToken } = jest.requireMock(
    '../../../src/utils/emailTokenGenerator.js',
) as { generatePasswordChangeToken: jest.Mock };

const {
    sendVerificationEmail,
    sendPasswordChangeConfirmationEmail,
    sendPasswordChangedNotification,
} = jest.requireMock('../../../src/utils/mailer.js') as {
    sendVerificationEmail: jest.Mock;
    sendPasswordChangeConfirmationEmail: jest.Mock;
    sendPasswordChangedNotification: jest.Mock;
};

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new AuthService();
    });

    describe('register', () => {
        it('creates a user, hashes the password, and sends a verification email', async () => {
            const data = buildRegisterDTO();
            const createdUser = buildUser({ ...data });
            userServiceMock.existsByEmail.mockResolvedValue(false);
            userServiceMock.existsByUsername.mockResolvedValue(false);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
            authRepositoryMock.createUserWithAuth.mockResolvedValue(createdUser);

            const result = await service.register(data);

            expect(userServiceMock.existsByEmail).toHaveBeenCalledWith(data.email);
            expect(userServiceMock.existsByUsername).toHaveBeenCalledWith(data.username);
            expect(authRepositoryMock.createUserWithAuth).toHaveBeenCalledWith({
                username: data.username,
                name: data.name,
                email: data.email,
                hashedPassword: 'hashed-password',
            });
            expect(sendVerificationEmail).toHaveBeenCalledWith({
                userId: createdUser.id,
                email: createdUser.email,
                username: createdUser.username,
            });
            expect(result).toEqual({
                user: {
                    id: createdUser.id,
                    username: createdUser.username,
                    name: createdUser.name,
                    email: createdUser.email,
                    role: createdUser.role,
                },
            });
        });

        it('throws ConflictError when email already exists', async () => {
            userServiceMock.existsByEmail.mockResolvedValue(true);

            await expect(service.register(buildRegisterDTO())).rejects.toMatchObject({
                message: ERROR_MESSAGES.EMAIL_ALREADY_IN_USE,
                details: { field: 'email' },
            });
            await expect(service.register(buildRegisterDTO())).rejects.toThrow(ConflictError);
            expect(authRepositoryMock.createUserWithAuth).not.toHaveBeenCalled();
        });

        it('throws ConflictError when username already exists', async () => {
            userServiceMock.existsByEmail.mockResolvedValue(false);
            userServiceMock.existsByUsername.mockResolvedValue(true);
            await expect(service.register(buildRegisterDTO())).rejects.toMatchObject({
                message: ERROR_MESSAGES.USERNAME_ALREADY_TAKEN,
                details: { field: 'username' },
            });
            await expect(service.register(buildRegisterDTO())).rejects.toThrow(ConflictError);
            await expect(service.register(buildRegisterDTO())).rejects.toThrow(ConflictError);
            expect(authRepositoryMock.createUserWithAuth).not.toHaveBeenCalled();
        });
    });

    describe('login', () => {
        it('returns a token and user when credentials are valid', async () => {
            const data = buildLoginDTO();
            const user = buildUser({ email: data.email, isEmailVerified: true });
            const auth = buildAuth({ userId: user.id });
            userServiceMock.findUserByEmail.mockResolvedValue(user);
            authRepositoryMock.findAuthByUserId.mockResolvedValue(auth);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue('signed-token');

            const result = await service.login(data);

            expect(bcrypt.compare).toHaveBeenCalledWith(data.password, auth.password);
            expect(result).toEqual({
                token: 'signed-token',
                user: {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        });

        it('throws UnauthorizedError when the user does not exist', async () => {
            userServiceMock.findUserByEmail.mockResolvedValue(null);

            await expect(service.login(buildLoginDTO())).rejects.toThrow(UnauthorizedError);
        });

        it('throws UnauthorizedError when the email is not verified', async () => {
            userServiceMock.findUserByEmail.mockResolvedValue(
                buildUser({ isEmailVerified: false }),
            );

            await expect(service.login(buildLoginDTO())).rejects.toThrow(UnauthorizedError);
        });

        it('throws UnauthorizedError when no auth record is found', async () => {
            userServiceMock.findUserByEmail.mockResolvedValue(buildUser({ isEmailVerified: true }));
            authRepositoryMock.findAuthByUserId.mockResolvedValue(null);

            await expect(service.login(buildLoginDTO())).rejects.toThrow(UnauthorizedError);
        });

        it('throws ValidationError when the password is invalid', async () => {
            const user = buildUser({ isEmailVerified: true });
            authRepositoryMock.findAuthByUserId.mockResolvedValue(buildAuth({ userId: user.id }));
            userServiceMock.findUserByEmail.mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.login(buildLoginDTO())).rejects.toThrow(ValidationError);
        });
    });

    describe('confirmEmail', () => {
        it('marks the email as verified for a valid token', async () => {
            const user = buildUser({
                id: 'u-1',
                email: 'john@example.com',
                isEmailVerified: false,
            });
            (jwt.verify as jest.Mock).mockReturnValue({
                userId: 'u-1',
                email: 'john@example.com',
                type: 'email-verification',
            });
            userServiceMock.findUserByEmail.mockResolvedValue(user);

            await service.confirmEmail('valid-token');

            expect(userServiceMock.markEmailVerified).toHaveBeenCalledWith('u-1');
        });

        it('throws ValidationError when the token payload is invalid', async () => {
            (jwt.verify as jest.Mock).mockReturnValue({ type: 'wrong-type' });

            await expect(service.confirmEmail('bad-token')).rejects.toThrow(ValidationError);
        });

        it('throws NotFoundError when the user does not exist', async () => {
            (jwt.verify as jest.Mock).mockReturnValue({
                userId: 'u-1',
                email: 'john@example.com',
                type: 'email-verification',
            });
            userServiceMock.findUserByEmail.mockResolvedValue(null);

            await expect(service.confirmEmail('valid-token')).rejects.toThrow(NotFoundError);
        });

        it('throws NotFoundError when the token userId does not match the found user', async () => {
            (jwt.verify as jest.Mock).mockReturnValue({
                userId: 'u-1',
                email: 'john@example.com',
                type: 'email-verification',
            });
            userServiceMock.findUserByEmail.mockResolvedValue(buildUser({ id: 'u-2' }));

            await expect(service.confirmEmail('valid-token')).rejects.toThrow(NotFoundError);
        });

        it('returns successfully when the email is already verified', async () => {
            (jwt.verify as jest.Mock).mockReturnValue({
                userId: 'u-1',
                email: 'john@example.com',
                type: 'email-verification',
            });
            userServiceMock.findUserByEmail.mockResolvedValue(
                buildUser({ id: 'u-1', isEmailVerified: true }),
            );

            await expect(service.confirmEmail('valid-token')).resolves.toBeUndefined();
            expect(userServiceMock.markEmailVerified).not.toHaveBeenCalled();
        });
    });

    describe('resendConfirmationEmail', () => {
        it('sends a new verification email for an unverified user', async () => {
            const user = buildUser({ isEmailVerified: false });
            userServiceMock.findUserByEmail.mockResolvedValue(user);

            await service.resendConfirmationEmail(
                buildResendConfirmationEmailDTO({ email: user.email }),
            );

            expect(sendVerificationEmail).toHaveBeenCalledWith({
                userId: user.id,
                email: user.email,
                username: user.username,
            });
        });

        it('throws NotFoundError when the user does not exist', async () => {
            userServiceMock.findUserByEmail.mockResolvedValue(null);

            await expect(
                service.resendConfirmationEmail(buildResendConfirmationEmailDTO()),
            ).rejects.toThrow(NotFoundError);
        });

        it('throws ConflictError when the email is already verified', async () => {
            userServiceMock.findUserByEmail.mockResolvedValue(buildUser({ isEmailVerified: true }));

            await expect(
                service.resendConfirmationEmail(buildResendConfirmationEmailDTO()),
            ).rejects.toThrow(ConflictError);
        });
    });

    describe('initiatePasswordChange', () => {
        it('validates the old password and sends a confirmation email', async () => {
            const auth = buildAuth({ userId: 'u-1' });
            const user = buildUser({ id: 'u-1' });
            authRepositoryMock.findAuthByUserId.mockResolvedValue(auth);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            userServiceMock.getUserById.mockResolvedValue(user);
            generatePasswordChangeToken.mockReturnValue('change-token');

            await service.initiatePasswordChange('u-1', buildInitiatePasswordChangeDTO());

            expect(authRepositoryMock.setPasswordChangeToken).toHaveBeenCalledWith(
                'u-1',
                'change-token',
            );
            expect(sendPasswordChangeConfirmationEmail).toHaveBeenCalledWith({
                userId: 'u-1',
                email: user.email,
                username: user.username,
                token: 'change-token',
            });
        });

        it('throws ValidationError when the old password is incorrect', async () => {
            authRepositoryMock.findAuthByUserId.mockResolvedValue(buildAuth());
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(
                service.initiatePasswordChange('u-1', buildInitiatePasswordChangeDTO()),
            ).rejects.toThrow(ValidationError);
            expect(authRepositoryMock.setPasswordChangeToken).not.toHaveBeenCalled();
        });

        it('throws NotFoundError when no auth record exists for the user', async () => {
            authRepositoryMock.findAuthByUserId.mockResolvedValue(null);

            await expect(
                service.initiatePasswordChange('missing', buildInitiatePasswordChangeDTO()),
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('validatePasswordChangeToken', () => {
        it('returns the token when it is valid and matches the stored token', async () => {
            (jwt.verify as jest.Mock).mockReturnValue({ sub: 'u-1', type: 'password-change' });
            authRepositoryMock.findAuthByUserId.mockResolvedValue(
                buildAuth({
                    userId: 'u-1',
                    passwordChangeToken: 'token-1',
                    isPasswordChangeTokenValid: true,
                }),
            );

            const result = await service.validatePasswordChangeToken('token-1');

            expect(result).toEqual({ token: 'token-1' });
        });

        it('throws ValidationError when the jwt payload type is wrong', async () => {
            (jwt.verify as jest.Mock).mockReturnValue({ sub: 'u-1', type: 'wrong-type' });

            await expect(service.validatePasswordChangeToken('token-1')).rejects.toThrow(
                ValidationError,
            );
        });

        it('throws ValidationError when the stored token does not match or is invalid', async () => {
            (jwt.verify as jest.Mock).mockReturnValue({ sub: 'u-1', type: 'password-change' });
            authRepositoryMock.findAuthByUserId.mockResolvedValue(
                buildAuth({
                    userId: 'u-1',
                    passwordChangeToken: 'other-token',
                    isPasswordChangeTokenValid: true,
                }),
            );

            await expect(service.validatePasswordChangeToken('token-1')).rejects.toThrow(
                ValidationError,
            );
        });
    });

    describe('confirmPasswordChange', () => {
        it('updates the password and sends a notification email', async () => {
            const data = buildConfirmPasswordChangeDTO({
                token: 'token-1',
                newPassword: 'NewPass123!',
            });
            (jwt.verify as jest.Mock).mockReturnValue({ sub: 'u-1', type: 'password-change' });
            authRepositoryMock.findAuthByUserId.mockResolvedValue(
                buildAuth({
                    userId: 'u-1',
                    password: 'old-hash',
                    passwordChangeToken: 'token-1',
                    isPasswordChangeTokenValid: true,
                }),
            );
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);
            (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
            userServiceMock.getUserById.mockResolvedValue(buildUser({ id: 'u-1' }));

            await service.confirmPasswordChange(data);

            expect(authRepositoryMock.changePasswordAndConsumeToken).toHaveBeenCalledWith(
                'u-1',
                'new-hash',
            );
            expect(sendPasswordChangedNotification).toHaveBeenCalled();
        });

        it('throws ValidationError when the stored token does not match or is invalid', async () => {
            (jwt.verify as jest.Mock).mockReturnValue({ sub: 'u-1', type: 'password-change' });
            authRepositoryMock.findAuthByUserId.mockResolvedValue(
                buildAuth({
                    userId: 'u-1',
                    passwordChangeToken: 'other-token',
                    isPasswordChangeTokenValid: true,
                }),
            );

            await expect(
                service.confirmPasswordChange(buildConfirmPasswordChangeDTO({ token: 'token-1' })),
            ).rejects.toThrow(ValidationError);
        });

        it('throws ValidationError when the new password matches the current one', async () => {
            (jwt.verify as jest.Mock).mockReturnValue({ sub: 'u-1', type: 'password-change' });
            authRepositoryMock.findAuthByUserId.mockResolvedValue(
                buildAuth({
                    userId: 'u-1',
                    passwordChangeToken: 'token-1',
                    isPasswordChangeTokenValid: true,
                }),
            );
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            await expect(
                service.confirmPasswordChange(buildConfirmPasswordChangeDTO({ token: 'token-1' })),
            ).rejects.toThrow(ValidationError);
            expect(authRepositoryMock.changePasswordAndConsumeToken).not.toHaveBeenCalled();
        });
    });

    describe('findAuthByUserId', () => {
        it('returns the auth record when found', async () => {
            const auth = buildAuth({ userId: 'u-1' });
            authRepositoryMock.findAuthByUserId.mockResolvedValue(auth);

            await expect(service.findAuthByUserId('u-1')).resolves.toBe(auth);
        });

        it('throws NotFoundError when no auth record exists', async () => {
            authRepositoryMock.findAuthByUserId.mockResolvedValue(null);

            await expect(service.findAuthByUserId('missing')).rejects.toThrow(NotFoundError);
        });
    });
});
