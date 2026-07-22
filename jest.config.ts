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
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/server.ts',
        '!src/routes/**',
        '!src/middleware/**',
        '!src/config/**',
        '!src/constants/**',
        '!src/templates/**',
        '!src/types/**',
        '!src/docs/**',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
};

export default config;
