import { UserService } from '../../../src/services/user.services.js';
import { ConflictError, NotFoundError } from '../../../src/common/errors.js';
import {
    buildCreateUserDTO,
    buildListUsersQuery,
    buildUpdateUserDTO,
    buildUpdateUserProfileDTO,
    buildUser,
    buildUserList,
} from '../../factories/user.factory.js';
import {
    createUserRepositoryMock,
    type UserRepositoryMock,
} from '../../mocks/repositories.mock.js';

jest.mock('../../../src/utils/mailer.js', () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    sendEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordChangeConfirmationEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordChangedNotification: jest.fn().mockResolvedValue(undefined),
}));

describe('UserService', () => {
    let service: UserService;
    let repo: UserRepositoryMock;

    beforeEach(() => {
        service = new UserService();
        repo = createUserRepositoryMock();
        service.userRepository = repo;
    });

    describe('createUser', () => {
        it('creates and returns a UserDTO when email and username are free', async () => {
            const input = buildCreateUserDTO();
            const stored = buildUser({ ...input });
            repo.existsByEmail.mockResolvedValue(false);
            repo.existsByUsername.mockResolvedValue(false);
            repo.create.mockResolvedValue(stored);

            const result = await service.createUser(input);

            expect(repo.existsByEmail).toHaveBeenCalledWith(input.email);
            expect(repo.existsByUsername).toHaveBeenCalledWith(input.username);
            expect(repo.create).toHaveBeenCalledWith(input);
            expect(result).toMatchObject({
                id: stored.id,
                email: stored.email,
                username: stored.username,
            });
        });

        it('throws ConflictError when email already exists', async () => {
            repo.existsByEmail.mockResolvedValue(true);

            await expect(service.createUser(buildCreateUserDTO())).rejects.toThrow(ConflictError);
            expect(repo.create).not.toHaveBeenCalled();
        });

        it('throws ConflictError when username already exists', async () => {
            repo.existsByEmail.mockResolvedValue(false);
            repo.existsByUsername.mockResolvedValue(true);

            await expect(service.createUser(buildCreateUserDTO())).rejects.toThrow(ConflictError);
            expect(repo.create).not.toHaveBeenCalled();
        });
    });

    describe('getAllUsers', () => {
        it('returns paginated list mapped to DTOs', async () => {
            const query = buildListUsersQuery();
            const users = buildUserList(2);
            repo.findAll.mockResolvedValue({ data: users, total: 2 });

            const result = await service.getAllUsers(query);

            expect(repo.findAll).toHaveBeenCalledWith(query);
            expect(result.data).toHaveLength(2);
            expect(result.data[0]).toMatchObject({ id: users[0]!.id });
            expect(result.meta).toEqual({ offset: query.offset, limit: query.limit, total: 2 });
        });

        it('omits total from meta when not provided by the repository', async () => {
            const query = buildListUsersQuery({ count: false });
            const users = buildUserList(1);
            repo.findAll.mockResolvedValue({ data: users });

            const result = await service.getAllUsers(query);

            expect(result.meta).not.toHaveProperty('total');
        });
    });

    describe('getUserById', () => {
        it('returns a UserDTO when user is found', async () => {
            const user = buildUser({ id: 'u-1' });
            repo.findById.mockResolvedValue(user);

            const result = await service.getUserById('u-1');

            expect(repo.findById).toHaveBeenCalledWith('u-1');
            expect(result.id).toBe('u-1');
        });

        it('throws NotFoundError when user does not exist', async () => {
            repo.findById.mockResolvedValue(null);

            await expect(service.getUserById('missing')).rejects.toThrow(NotFoundError);
        });
    });

    describe('getUserByEmail', () => {
        it('returns a UserDTO when user is found', async () => {
            const user = buildUser({ email: 'find@me.com' });
            repo.findByEmail.mockResolvedValue(user);

            const result = await service.getUserByEmail('find@me.com');

            expect(result.email).toBe('find@me.com');
        });

        it('throws NotFoundError when email is not found', async () => {
            repo.findByEmail.mockResolvedValue(null);

            await expect(service.getUserByEmail('nobody@nowhere.com')).rejects.toThrow(
                NotFoundError,
            );
        });
    });

    describe('getUserProfile', () => {
        it('delegates to getUserById', async () => {
            const user = buildUser({ id: 'me' });
            repo.findById.mockResolvedValue(user);

            const result = await service.getUserProfile('me');

            expect(result.id).toBe('me');
            expect(repo.findById).toHaveBeenCalledWith('me');
        });
    });

    describe('findUserByEmail', () => {
        it('returns the raw User or null (no DTO wrapping)', async () => {
            const user = buildUser();
            repo.findByEmail.mockResolvedValue(user);

            await expect(service.findUserByEmail(user.email)).resolves.toBe(user);
        });

        it('returns null when user is not found', async () => {
            repo.findByEmail.mockResolvedValue(null);

            await expect(service.findUserByEmail('x@y.com')).resolves.toBeNull();
        });
    });

    describe('markEmailVerified', () => {
        it('flips the flag via the repository and returns DTO', async () => {
            const user = buildUser({ isEmailVerified: true });
            repo.markEmailVerified.mockResolvedValue(user);

            const result = await service.markEmailVerified(user.id);

            expect(repo.markEmailVerified).toHaveBeenCalledWith(user.id);
            expect(result.id).toBe(user.id);
        });
    });

    describe('updateUser', () => {
        it('updates the user and returns DTO', async () => {
            const existing = buildUser({ id: 'u-1' });
            const data = buildUpdateUserDTO({ name: 'New Name' });
            const updated = { ...existing, name: 'New Name' };
            repo.findById.mockResolvedValue(existing);
            repo.update.mockResolvedValue(updated);

            const result = await service.updateUser('u-1', data);

            expect(repo.update).toHaveBeenCalledWith('u-1', data);
            expect(result.name).toBe('New Name');
        });

        it('throws NotFoundError when the user does not exist', async () => {
            repo.findById.mockResolvedValue(null);

            await expect(service.updateUser('missing', buildUpdateUserDTO())).rejects.toThrow(
                NotFoundError,
            );
            expect(repo.update).not.toHaveBeenCalled();
        });
    });

    describe('updateUserProfile', () => {
        it('updates name without touching email verification', async () => {
            const existing = buildUser({ id: 'me', isEmailVerified: true });
            const data = buildUpdateUserProfileDTO({ name: 'Updated' });
            repo.findById.mockResolvedValue(existing);
            repo.existsByUsernameExcludingUser.mockResolvedValue(false);
            repo.update.mockResolvedValue({ ...existing, name: 'Updated' });

            await service.updateUserProfile('me', data);

            expect(repo.update).toHaveBeenCalledWith('me', data);
        });

        it('throws NotFoundError when the user does not exist', async () => {
            repo.findById.mockResolvedValue(null);

            await expect(
                service.updateUserProfile('missing', buildUpdateUserProfileDTO()),
            ).rejects.toThrow(NotFoundError);
            expect(repo.update).not.toHaveBeenCalled();
        });

        it('throws ConflictError when changing to an already-used username', async () => {
            const existing = buildUser({ id: 'me', username: 'old' });
            const data = buildUpdateUserProfileDTO({ username: 'taken' });
            repo.findById.mockResolvedValue(existing);
            repo.existsByUsernameExcludingUser.mockResolvedValue(true);

            await expect(service.updateUserProfile('me', data)).rejects.toThrow(ConflictError);
            expect(repo.update).not.toHaveBeenCalled();
        });

        it('throws ConflictError when changing to an already-used email', async () => {
            const existing = buildUser({ id: 'me', email: 'old@me.com' });
            const data = buildUpdateUserProfileDTO({ email: 'taken@me.com' });
            repo.findById.mockResolvedValue(existing);
            repo.existsByEmailExcludingUser.mockResolvedValue(true);

            await expect(service.updateUserProfile('me', data)).rejects.toThrow(ConflictError);
            expect(repo.update).not.toHaveBeenCalled();
        });

        it('resets isEmailVerified to false when email changes and triggers verification email', async () => {
            const { sendVerificationEmail } = jest.requireMock('../../../src/utils/mailer.js');
            const existing = buildUser({ id: 'me', email: 'old@me.com', isEmailVerified: true });
            const newEmail = 'new@me.com';
            const data = buildUpdateUserProfileDTO({ email: newEmail });
            const updated = {
                ...existing,
                email: newEmail,
                isEmailVerified: false,
            };
            repo.findById.mockResolvedValue(existing);
            repo.existsByEmailExcludingUser.mockResolvedValue(false);
            repo.update.mockResolvedValue(updated);

            await service.updateUserProfile('me', data);

            expect(repo.update).toHaveBeenCalledWith('me', { ...data, isEmailVerified: false });
            await new Promise((resolve) => setImmediate(resolve));
            expect(sendVerificationEmail).toHaveBeenCalledWith({
                userId: updated.id,
                email: updated.email,
                username: updated.username,
            });
        });

        it('does not reset isEmailVerified or send email when the same email is re-submitted', async () => {
            const { sendVerificationEmail } = jest.requireMock('../../../src/utils/mailer.js');
            const existing = buildUser({ id: 'me', email: 'same@me.com', isEmailVerified: true });
            const data = buildUpdateUserProfileDTO({ email: 'same@me.com' });
            repo.findById.mockResolvedValue(existing);
            repo.existsByEmailExcludingUser.mockResolvedValue(false);
            repo.update.mockResolvedValue(existing);

            await service.updateUserProfile('me', data);

            expect(repo.update).toHaveBeenCalledWith('me', data);
            await new Promise((resolve) => setImmediate(resolve));
            expect(sendVerificationEmail).not.toHaveBeenCalled();
        });
    });

    describe('softDelete', () => {
        it('soft-deletes the user and returns DTO', async () => {
            const existing = buildUser({ id: 'u-1' });
            const deleted = { ...existing, isDeleted: true };
            repo.findById.mockResolvedValue(existing);
            repo.softDelete.mockResolvedValue(deleted);

            const result = await service.softDelete('u-1');

            expect(repo.softDelete).toHaveBeenCalledWith('u-1');
            expect(result.id).toBe('u-1');
        });

        it('throws NotFoundError when the user does not exist', async () => {
            repo.findById.mockResolvedValue(null);

            await expect(service.softDelete('missing')).rejects.toThrow(NotFoundError);
            expect(repo.softDelete).not.toHaveBeenCalled();
        });
    });

    describe('existsByUsername / existsByEmail', () => {
        it('existsByUsername delegates to the repository', async () => {
            repo.existsByUsername.mockResolvedValue(true);

            await expect(service.existsByUsername('foo')).resolves.toBe(true);
            expect(repo.existsByUsername).toHaveBeenCalledWith('foo');
        });

        it('existsByEmail delegates to the repository', async () => {
            repo.existsByEmail.mockResolvedValue(false);

            await expect(service.existsByEmail('a@b.com')).resolves.toBe(false);
            expect(repo.existsByEmail).toHaveBeenCalledWith('a@b.com');
        });
    });
});
