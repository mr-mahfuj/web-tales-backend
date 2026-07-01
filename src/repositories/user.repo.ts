import { Prisma } from '@prisma/client';
import type { CreateUserDTO, UpdateUserDTO, UserDTO } from '../dtos/user.dto.js';
import prisma from '../config/prisma.js';
import {
    BadRequestError,
    ConflictError,
    DatabaseError,
    InternalServerError,
    NotFoundError,
} from '../errors/index.js';
import type { IUserRepository } from '../interfaces/IUserRepository.js';
import { isRecord } from '../utils/error-formatters.js';

type PrismaErrorWithMetadata = {
    code?: string;
    meta?: unknown;
    message?: string;
    clientVersion?: string;
};

function buildPrismaDetails(error: PrismaErrorWithMetadata): Record<string, unknown> | undefined {
    const details: Record<string, unknown> = {};

    if (error.code) {
        details.prismaCode = error.code;
    }

    if (error.message) {
        details.prismaMessage = error.message;
    }

    if (error.clientVersion) {
        details.clientVersion = error.clientVersion;
    }

    if (isRecord(error.meta)) {
        if ('target' in error.meta) {
            details.target = error.meta.target;
        }

        if ('modelName' in error.meta) {
            details.modelName = error.meta.modelName;
        }

        if ('cause' in error.meta) {
            details.cause = error.meta.cause;
        }
    }

    return Object.keys(details).length > 0 ? details : undefined;
}

function translatePrismaError(error: unknown): unknown {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const details = buildPrismaDetails(error);

        switch (error.code) {
            case 'P2002':
                return new ConflictError(
                    'A resource with the same unique field already exists',
                    details,
                    error,
                );
            case 'P2025':
                return new NotFoundError('Record not found', details, error);
            default:
                return new DatabaseError('Database request failed', details, error);
        }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
        return new BadRequestError('Database validation failed', buildPrismaDetails(error), error);
    }

    if (
        error instanceof Prisma.PrismaClientInitializationError ||
        error instanceof Prisma.PrismaClientRustPanicError
    ) {
        return new InternalServerError(
            'Database initialization failed',
            buildPrismaDetails(error),
            error,
        );
    }

    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        return new DatabaseError('Database request failed', buildPrismaDetails(error), error);
    }

    return error;
}

export class UserRepository implements IUserRepository {
    private async execute<T>(operation: () => Promise<T>): Promise<T> {
        try {
            return await operation();
        } catch (error) {
            throw translatePrismaError(error);
        }
    }

    async create(data: CreateUserDTO): Promise<UserDTO> {
        return this.execute(() =>
            prisma.user.create({
                data,
            }),
        );
    }

    async findAll(): Promise<UserDTO[]> {
        return this.execute(() =>
            prisma.user.findMany({
                where: {
                    isDeleted: false,
                },
                orderBy: {
                    id: 'asc',
                },
            }),
        );
    }

    async findById(userId: string): Promise<UserDTO | null> {
        return this.execute(() =>
            prisma.user.findFirst({
                where: {
                    id: userId,
                    isDeleted: false,
                },
            }),
        );
    }

    async findByEmail(email: string): Promise<UserDTO | null> {
        return this.execute(() =>
            prisma.user.findFirst({
                where: {
                    email,
                    isDeleted: false,
                },
            }),
        );
    }

    async update(userId: string, data: UpdateUserDTO): Promise<UserDTO> {
        return this.execute(() =>
            prisma.user.update({
                where: {
                    id: userId,
                },
                data,
            }),
        );
    }

    async softDelete(userId: string): Promise<UserDTO> {
        return this.execute(() =>
            prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    isDeleted: true,
                },
            }),
        );
    }
}
