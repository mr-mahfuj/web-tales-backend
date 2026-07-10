import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from '../repositories/auth.repository.js';
import { ConflictError, NotFoundError, ValidationError } from '../common/errors.js';
import type { RegisterDto, ChangePasswordDto, LoginDto } from '../dtos/auth.dto.js';
import { env } from '../config/env.js';
import { UserService } from './user.services.js';
import type { Role } from '../types/role.type.js';

const authRepository = new AuthRepository();
const userService = new UserService();

function signToken(userId: string, role: Role = 'USER') {
    return jwt.sign({ sub: userId, role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export class AuthService {
    async register(data: RegisterDto) {
        if (await userService.existsByEmail(data.email)) throw new ConflictError();
        if (await userService.existsByUsername(data.username)) throw new ConflictError();

        const hashedPassword = await bcrypt.hash(data.password, env.saltRounds);

        const user = await authRepository.createUserWithAuth({
            username: data.username,
            name: data.name,
            email: data.email,
            hashedPassword,
        });

        const token = signToken(user.id, user.role);

        return {
            token,
            user: { id: user.id, username: user.username, name: user.name, email: user.email },
        };
    }

    async login(data: LoginDto) {
        const user = await userService.getUserByEmail(data.email);
        if (!user) {
            throw new ValidationError();
        }
        const auth = await authRepository.findAuthByUserId(user.id);
        if (!auth) {
            throw new ValidationError();
        }

        const isPasswordValid = await bcrypt.compare(data.password, auth.password);
        if (!isPasswordValid) {
            throw new ValidationError();
        }

        const token = signToken(user.id, user.role);

        return {
            token,
            user: { id: user.id, username: user.username, name: user.name, email: user.email },
        };
    }

    async changePassword(userId: string, data: ChangePasswordDto) {
        const auth = await authRepository.findAuthByUserId(userId);
        if (!auth) throw new NotFoundError();

        const isPasswordValid = await bcrypt.compare(data.oldPassword, auth.password);
        if (!isPasswordValid) {
            throw new NotFoundError();
        }

        const hashedPassword = await bcrypt.hash(data.newPassword, env.saltRounds);
        await authRepository.updatePassword(userId, hashedPassword);

        return { message: 'Password changed successfully' };
    }
}
