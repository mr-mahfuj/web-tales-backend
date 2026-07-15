import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import * as yaml from 'js-yaml';
import swaggerJsdoc from 'swagger-jsdoc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsRoot = path.resolve(__dirname, '../docs');

type OpenApiFragment = Record<string, unknown>;

const readYaml = (relativePath: string): OpenApiFragment => {
    const absolute = path.join(docsRoot, relativePath);
    const raw = fs.readFileSync(absolute, 'utf8');
    return yaml.load(raw) as OpenApiFragment;
};

const schemas = (readYaml('components/schemas.yaml') as OpenApiFragment)
    .components as OpenApiFragment;
const parameters = (readYaml('components/parameters.yaml') as OpenApiFragment)
    .components as OpenApiFragment;
const requestBodies = (readYaml('components/requestBodies.yaml') as OpenApiFragment)
    .components as OpenApiFragment;
const responses = (readYaml('components/responses.yaml') as OpenApiFragment)
    .components as OpenApiFragment;
const security = (readYaml('components/security.yaml') as OpenApiFragment)
    .components as OpenApiFragment;
const tagDoc = readYaml('components/tags.yaml');
const tags = Array.isArray(tagDoc.tags) ? (tagDoc.tags as unknown[]) : [];

const baseSpec: OpenApiFragment = {
    openapi: '3.0.3',
    info: {
        title: 'Web Tales API',
        version: '1.0.0',
        description: `
REST API for the **Web Tales** blogging platform. Provides user accounts,
email-based authentication with JWT, stories, AI generated summaries, and
categories.

## Authentication

Most endpoints require a JWT obtained from \`POST /auth/login\`.
Send it on every protected request as:

\`\`\`
Authorization: Bearer <token>
\`\`\`

Tokens expire per the \`JWT_EXPIRES_IN\` environment variable (default: 30 days).
When you see a 🔒 **lock** icon in Swagger UI, the endpoint requires this header.

## Error format

All errors share the same envelope:

\`\`\`json
{
  "success": false,
  "error": {
    "message": "User not found",
    "code": "NOT_FOUND",
    "details": { "userId": "..." }
  }
}
\`\`\`

The optional \`details\` field is included for validation errors (as a list of
per-field issues) and for 5xx errors when \`NODE_ENV=development\`.
        `.trim(),
        contact: {
            name: 'Web Tales',
            url: 'https://github.com/mr-mahfuj/web-tales-backend',
        },
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Local development',
        },
    ],
    tags,
};

const baseGenerated = swaggerJsdoc({ definition: baseSpec as never, apis: [] }) as OpenApiFragment;

const merged: OpenApiFragment = {
    ...baseGenerated,
    components: {
        ...((baseGenerated.components as OpenApiFragment | undefined) ?? {}),
        ...schemas,
        ...parameters,
        ...requestBodies,
        ...responses,
        ...security,
    } as OpenApiFragment,
};

const pathFiles = [
    'paths/health.yaml',
    'paths/auth.yaml',
    'paths/users.yaml',
    'paths/profile.yaml',
    'paths/stories.yaml',
    'paths/categories.yaml',
];

const paths: Record<string, unknown> = {};
for (const file of pathFiles) {
    const fragment = readYaml(file);
    const declared = fragment.paths as Record<string, unknown> | undefined;
    if (!declared) continue;
    Object.assign(paths, declared);
}

merged.paths = paths;

const outputPath = path.resolve(__dirname, 'openapi.json');
fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));

// eslint-disable-next-line no-console
console.log(`OpenAPI spec written to ${outputPath}`);

export default merged;
