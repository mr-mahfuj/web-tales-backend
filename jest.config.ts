import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    roots: ['<rootDir>/src', '<rootDir>/tests'],
    testMatch: ['**/*.test.ts', '**/*.spec.ts'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
        '^.+\\.ts$': [
            'ts-jest',
            {
                useESM: true,
                tsconfig: {
                    verbatimModuleSyntax: true,
                    module: 'esnext',
                    target: 'esnext',
                    isolatedModules: true,
                    esModuleInterop: true,
                    moduleResolution: 'bundler',
                    ignoreDeprecations: '6.0',
                },
            },
        ],
    },
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    clearMocks: true,
    collectCoverageFrom: ['src/controllers/**/*.ts', 'src/services/**/*.ts'],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
};

export default config;
