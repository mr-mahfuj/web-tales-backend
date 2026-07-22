import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
    {
        ignores: ['dist', 'node_modules', 'coverage'],
    },

    js.configs.recommended,

    ...tseslint.configs.recommended,

    eslintConfigPrettier,

    {
        files: ['**/*.ts'],

        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: ['prisma/seed.ts', 'jest.config.ts', 'prisma.config.ts'],
                },
            },
            globals: globals.node,
        },

        rules: {
            'no-console': 'warn',
            'no-unused-vars': 'off',

            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                },
            ],

            '@typescript-eslint/no-explicit-any': 'warn',

            '@typescript-eslint/consistent-type-imports': 'error',
        },
    },
);
