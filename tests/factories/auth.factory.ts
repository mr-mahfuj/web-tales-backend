export function buildRegisterDTO(overrides = {}) {
    return {
        username: 'johndoe',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        ...overrides,
    };
}

export function buildLoginDTO(overrides = {}) {
    return {
        email: 'john@example.com',
        password: 'Password123!',
        ...overrides,
    };
}

export function buildInitiatePasswordChangeDTO(overrides = {}) {
    return {
        oldPassword: 'OldPassword123!',
        ...overrides,
    };
}

export function buildConfirmPasswordChangeDTO(overrides = {}) {
    return {
        token: 'password-change-token',
        newPassword: 'NewPassword123!',
        ...overrides,
    };
}

export function buildResendConfirmationEmailDTO(overrides = {}) {
    return {
        email: 'john@example.com',
        ...overrides,
    };
}

export function buildAuth(overrides = {}) {
    return {
        userId: 'u-1',
        password: 'hashed-password',
        passwordChangeToken: null,
        isPasswordChangeTokenValid: false,
        ...overrides,
    };
}
